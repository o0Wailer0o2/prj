package vn.backend.core.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.request.StripeCreatePaymentRequest;
import vn.backend.core.data.response.StripeResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.OrderItemRepository;
import vn.backend.core.repository.OrderRepository;
import vn.backend.core.repository.PaymentRepository;
import vn.backend.core.repository.ProductRepository;
import vn.backend.entity.data.constant.OrderStatus;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripeService {
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    @Transactional
    public StripeResponse createPaymentFromOrder(StripeCreatePaymentRequest request) {
        Stripe.apiKey = secretKey;

        Order order = orderRepository.getById(request.getOrderId());
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        // Check if payment already completed
        Payment existingPayment = paymentRepository.findByOrderId(order.getId());
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new AppException("Payment has already been completed for this order", ErrorCode.BAD_REQUEST.getCode());
        }

        String domainSuccessUrl;
        String domainCancelUrl;
        try {
            domainSuccessUrl = request.getReturnUrl() + successUrl;
            domainCancelUrl = request.getReturnUrl() + cancelUrl;
            log.info("Payment session URLs created for domain: {}", request.getReturnUrl());
        } catch (Exception e) {
            throw new AppException(e.getMessage(), ErrorCode.FORBIDDEN.getCode());
        }

        // Build line items
        List<SessionCreateParams.LineItem> lineItems = buildLineItems(order);
        if (lineItems.isEmpty()) {
            throw new AppException("Order has no items", ErrorCode.BAD_REQUEST.getCode());
        }

        // Create Stripe session
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(domainSuccessUrl)
                .setCancelUrl(domainCancelUrl)
                .putMetadata("order_id", order.getId().toString())
                .putMetadata("payment_method", PaymentMethod.STRIPE.name())
                .putMetadata("return_url", request.getReturnUrl());

        for (SessionCreateParams.LineItem lineItem : lineItems) {
            paramsBuilder.addLineItem(lineItem);
        }

        // Add shipping if exists
        if (order.getDeliveryFee() != null && order.getDeliveryFee() > 0) {
            paramsBuilder.addLineItem(buildShippingLineItem(order.getDeliveryFee()));
        }

        SessionCreateParams params = paramsBuilder.build();

        Session session;
        try {
            session = Session.create(params);
        } catch (StripeException e) {
            log.error("Stripe session creation failed: {}", e.getMessage());
            throw new AppException("Failed to create payment session: " + e.getMessage(),
                    ErrorCode.INTERNAL_ERROR.getCode());
        }

        // Create or update Payment entity
        Payment payment;
        if (existingPayment != null) {
            existingPayment.setTransactionId(session.getId());
            existingPayment.setPaymentStatus(PaymentStatus.PENDING);
            existingPayment.setUpdatedAt(LocalDateTime.now());
            existingPayment.setGatewayResponseObject(session.toJson());
            payment = paymentRepository.update(existingPayment);
        } else {
            payment = Payment.builder()
                    .orderId(order.getId())
                    .transactionId(session.getId())
                    .externalReference(null)
                    .amount(order.getTotalPrice())
                    .currency("USD")
                    .paymentMethod(PaymentMethod.STRIPE)
                    .paymentStatus(PaymentStatus.PENDING)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            payment.setGatewayResponseObject(session.toJson());

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("user_id", order.getUserId());
            metadata.put("user_email", order.getUserEmail());
            metadata.put("order_code", order.getCode());
            metadata.put("return_url", request.getReturnUrl());
            payment.setMetadataMap(metadata);

            payment = paymentRepository.insert(payment);
        }

        log.info("Payment session created successfully for order {} from domain {}",
                order.getId(), request.getReturnUrl());

        // Build response
        return StripeResponse.builder()
                .sessionId(session.getId())
                .sessionUrl(session.getUrl())
                .build();
    }

    private List<SessionCreateParams.LineItem> buildLineItems(Order order) {
        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());

        for (OrderItem orderItem : orderItems) {
            // Get product (can be Book, CD, DVD, or Newspaper)
            Product product = productRepository.getById(orderItem.getProductId());
            if (product == null) {
                log.warn("Product not found for order item: {}", orderItem.getId());
                continue;
            }

            // Build product name with type indicator
            String productName = buildProductName(orderItem, product);

            // Build dynamic description based on product type
            String description = buildDescription(product);

            // Build product data
            SessionCreateParams.LineItem.PriceData.ProductData.Builder productDataBuilder =
                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                            .setName(productName);

            if (description != null && !description.isEmpty()) {
                // Stripe limits description to 500 chars
                String truncatedDesc = description.length() > 500
                        ? description.substring(0, 497) + "..."
                        : description;
                productDataBuilder.setDescription(truncatedDesc);
            }

            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                productDataBuilder.addImage(product.getImageUrl());
            }

            SessionCreateParams.LineItem.PriceData.ProductData productData = productDataBuilder.build();

            // Convert price to cents
            long unitAmount = Math.round(orderItem.getUnitPrice() * 100);

            // Validate price
            if (unitAmount <= 0) {
                log.warn("Invalid price for product: {} (price: {})",
                        product.getId(), orderItem.getUnitPrice());
                continue;
            }

            // Create price data
            SessionCreateParams.LineItem.PriceData priceData =
                    SessionCreateParams.LineItem.PriceData.builder()
                            .setCurrency("USD")
                            .setUnitAmount(unitAmount)
                            .setProductData(productData)
                            .build();

            // Create line item
            SessionCreateParams.LineItem lineItem =
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(Long.valueOf(orderItem.getQuantity()))
                            .setPriceData(priceData)
                            .build();

            lineItems.add(lineItem);

            log.debug("Added line item: {} (type: {}, price: ${}, qty: {})",
                    productName, product.getType(), orderItem.getUnitPrice(), orderItem.getQuantity());
        }

        return lineItems;
    }

    private String buildDescription(Product product) {
        if (product == null) {
            return null;
        }

        StringBuilder description = new StringBuilder();

        // Base description
        if (product.getDescription() != null) {
            description.append(product.getDescription());
        }

        // Add type-specific details
        switch (product.getType() != null ? product.getType().toUpperCase() : "") {
            case "BOOK":
                if (product instanceof Book) {
                    description.append(buildBookDescription((Book) product));
                }
                break;
            case "CD":
                if (product instanceof CD) {
                    description.append(buildCDDescription((CD) product));
                }
                break;
            case "DVD":
                if (product instanceof DVD) {
                    description.append(buildDVDDescription((DVD) product));
                }
                break;
            case "NEWSPAPER":
                if (product instanceof Newspaper) {
                    description.append(buildNewspaperDescription((Newspaper) product));
                }
                break;
        }

        return description.toString();
    }

    private static String buildBookDescription(Book book) {
        StringBuilder desc = new StringBuilder();
        if (book.getAuthors() != null) {
            desc.append("\nBy: ").append(book.getAuthors());
        }
        if (book.getPublisher() != null) {
            desc.append("\nPublisher: ").append(book.getPublisher());
        }
        if (book.getPages() != null) {
            desc.append("\nPages: ").append(book.getPages());
        }
        if (book.getLanguage() != null) {
            desc.append("\nLanguage: ").append(book.getLanguage());
        }
        return desc.toString();
    }

    private static String buildCDDescription(CD cd) {
        StringBuilder desc = new StringBuilder();
        if (cd.getArtists() != null) {
            desc.append("\nArtist: ").append(cd.getArtists());
        }
        if (cd.getRecordLabel() != null) {
            desc.append("\nLabel: ").append(cd.getRecordLabel());
        }
        if (cd.getGenre() != null) {
            desc.append("\nGenre: ").append(cd.getGenre());
        }
        if (cd.getLengthSeconds() != null) {
            int minutes = cd.getLengthSeconds() / 60;
            desc.append("\nDuration: ").append(minutes).append(" min");
        }
        return desc.toString();
    }

    private static String buildDVDDescription(DVD dvd) {
        StringBuilder desc = new StringBuilder();
        if (dvd.getDirector() != null) {
            desc.append("\nDirector: ").append(dvd.getDirector());
        }
        if (dvd.getStudio() != null) {
            desc.append("\nStudio: ").append(dvd.getStudio());
        }
        if (dvd.getRuntimeMinutes() != null) {
            desc.append("\nRuntime: ").append(dvd.getRuntimeMinutes()).append(" min");
        }
        if (dvd.getLanguage() != null) {
            desc.append("\nLanguage: ").append(dvd.getLanguage());
        }
        return desc.toString();
    }

    private static String buildNewspaperDescription(Newspaper newspaper) {
        StringBuilder desc = new StringBuilder();
        if (newspaper.getPublisher() != null) {
            desc.append("\nPublisher: ").append(newspaper.getPublisher());
        }
        if (newspaper.getIssueNumber() != null) {
            desc.append("\nIssue #").append(newspaper.getIssueNumber());
        }
        if (newspaper.getFrequency() != null) {
            desc.append("\nFrequency: ").append(newspaper.getFrequency());
        }
        return desc.toString();
    }

    /**
     * Build product name with type indicator
     */
    private String buildProductName(OrderItem orderItem, Product product) {
        String baseName = orderItem.getProductName() != null
                ? orderItem.getProductName()
                : product.getName();

        // Add type prefix for clarity
//        if (product.getType() != null) {
//            String typePrefix = switch (product.getType().toUpperCase()) {
//                case "BOOK" -> "📚";
//                case "CD" -> "💿";
//                case "DVD" -> "📀";
//                case "NEWSPAPER" -> "📰";
//                default -> "";
//            };
//
//            if (!typePrefix.isEmpty()) {
//                return typePrefix + " " + baseName;
//            }
//        }

        return baseName;
    }

    private SessionCreateParams.LineItem buildShippingLineItem(Double deliveryFee) {
        SessionCreateParams.LineItem.PriceData.ProductData shippingProductData =
                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("🚚 Shipping Fee")
                        .build();

        long shippingAmount = Math.round(deliveryFee * 100);

        SessionCreateParams.LineItem.PriceData shippingPriceData =
                SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency("USD")
                        .setUnitAmount(shippingAmount)
                        .setProductData(shippingProductData)
                        .build();

        return SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(shippingPriceData)
                .build();
    }

    /**
     * Handle Stripe webhook (PRIMARY METHOD)
     */
    public String handleWebhook(String payload, String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return "Webhook signature verification failed";
        }

        log.info("Received Stripe webhook: {}", event.getType());

        switch (event.getType()) {
            case "checkout.session.completed":
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (session != null) {
                    handleCheckoutSessionCompleted(session);
                }
                break;

            case "payment_intent.succeeded":
                log.info("Payment intent succeeded");
                break;

            case "payment_intent.payment_failed":
                log.warn("Payment intent failed");
                break;

            default:
                log.debug("Unhandled event type: {}", event.getType());
                break;
        }

        return "Webhook handled successfully";
    }

    private void handleCheckoutSessionCompleted(Session session) {
        String orderIdString = session.getMetadata().get("order_id");
        if (orderIdString == null) {
            log.warn("No order_id in session metadata");
            return;
        }

        Integer orderId = Integer.parseInt(orderIdString);

        Payment payment = paymentRepository.findByTransactionId(session.getId());
        if (payment != null) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setExternalReference(session.getPaymentIntent());
            payment.setPaidAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setGatewayResponseObject(session);
            paymentRepository.update(payment);

            log.info("Payment completed for order {}", orderId);
        }

        Order order = orderRepository.getById(orderId);
        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.PROCESSING);
            orderRepository.update(order);

            log.info("Order {} status updated to PROCESSING", orderId);
        }
    }

    /**
     * Verify payment (FALLBACK METHOD)
     */
    @Transactional
    public String verifyPayment(String sessionId) {
        try {
            Stripe.apiKey = secretKey;
            Session session = Session.retrieve(sessionId);

            if ("paid".equals(session.getPaymentStatus())) {
                Payment payment = paymentRepository.findByTransactionId(sessionId);

                if (payment != null) {
                    if (payment.getPaymentStatus() != PaymentStatus.COMPLETED) {
                        payment.setPaymentStatus(PaymentStatus.COMPLETED);
                        payment.setExternalReference(session.getPaymentIntent());
                        payment.setPaidAt(LocalDateTime.now());
                        payment.setUpdatedAt(LocalDateTime.now());
                        payment.setGatewayResponseObject(session);
                        paymentRepository.update(payment);

                        String orderIdString = session.getMetadata().get("order_id");
                        if (orderIdString != null) {
                            Integer orderId = Integer.parseInt(orderIdString);
                            Order order = orderRepository.getById(orderId);
                            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                                order.setStatus(OrderStatus.PROCESSING);
                                orderRepository.update(order);
                            }
                        }
                    }

                    return "Payment successful, order updated.";
                }

                return "Payment not found in database.";
            }

            return "Payment not completed yet.";
        } catch (StripeException e) {
            log.error("Payment verification failed: {}", e.getMessage());
            return "Error verifying payment: " + e.getMessage();
        }
    }

    public Payment getPaymentByOrderId(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}