package vn.backend.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.request.paypal.PayPalCaptureRequest;
import vn.backend.core.data.request.paypal.PayPalCreatePaymentRequest;
import vn.backend.core.data.request.paypal.PayPalRefundRequest;
import vn.backend.core.data.response.paypal.PayPalCaptureResponse;
import vn.backend.core.data.response.paypal.PayPalPaymentResponse;
import vn.backend.core.data.response.paypal.PayPalRefundResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.OrderRepository;
import vn.backend.core.repository.PaymentRepository;
import vn.backend.entity.data.constant.OrderStatus;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.Order;
import vn.backend.entity.data.mysql.Payment;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayPalService {
    
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${paypal.base-url}")
    private String baseUrl;

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    private String cachedAccessToken;
    private long tokenExpiryTime = 0;

    @Transactional
    public PayPalPaymentResponse createPaymentFromOrder(PayPalCreatePaymentRequest request) {
        Order order = orderRepository.getById(request.getOrderId());
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        Payment existingPayment = paymentRepository.findByOrderId(order.getId());
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new AppException("Payment has already been completed for this order", ErrorCode.BAD_REQUEST.getCode());
        }

        try {
            String accessToken = getAccessToken();
            String paypalOrderId = createPayPalOrder(accessToken, order, request);
            String approvalUrl = getApprovalUrl(accessToken, paypalOrderId);

            Payment payment;
            if (existingPayment != null) {
                existingPayment.setTransactionId(paypalOrderId);
                existingPayment.setPaymentStatus(PaymentStatus.PENDING);
                existingPayment.setUpdatedAt(LocalDateTime.now());
                Map<String, Object> gatewayResponse = new HashMap<>();
                gatewayResponse.put("paypal_order_id", paypalOrderId);
                gatewayResponse.put("approval_url", approvalUrl);
                existingPayment.setGatewayResponseObject(gatewayResponse);
                payment = paymentRepository.update(existingPayment);
            } else {
                payment = Payment.builder()
                        .orderId(order.getId())
                        .transactionId(paypalOrderId)
                        .amount(order.getTotalPrice())
                        .currency("USD")
                        .paymentMethod(PaymentMethod.VNPay)
                        .paymentStatus(PaymentStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                Map<String, Object> gatewayResponse = new HashMap<>();
                gatewayResponse.put("paypal_order_id", paypalOrderId);
                gatewayResponse.put("approval_url", approvalUrl);
                payment.setGatewayResponseObject(gatewayResponse);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("user_id", order.getUserId());
                metadata.put("user_email", order.getUserEmail());
                metadata.put("order_code", order.getCode());
                if (request.getReturnUrl() != null) {
                    metadata.put("return_url", request.getReturnUrl());
                }
                if (request.getCancelUrl() != null) {
                    metadata.put("cancel_url", request.getCancelUrl());
                }
                payment.setMetadataMap(metadata);

                payment = paymentRepository.insert(payment);
            }

            log.info("PayPal payment initiated for order {}: paypalOrderId={}", order.getId(), paypalOrderId);

            return PayPalPaymentResponse.builder()
                    .orderId(paypalOrderId)
                    .approvalUrl(approvalUrl)
                    .status("PENDING")
                    .build();

        } catch (Exception e) {
            log.error("Failed to create PayPal payment: {}", e.getMessage(), e);
            throw new AppException("Failed to create PayPal payment: " + e.getMessage(),
                    ErrorCode.INTERNAL_ERROR.getCode());
        }
    }

    @Transactional
    public PayPalCaptureResponse capturePayment(PayPalCaptureRequest request) {
        try {
            String accessToken = getAccessToken();
            String captureId = capturePayPalOrder(accessToken, request.getOrderId());

            Payment payment = paymentRepository.findByTransactionId(request.getOrderId());
            if (payment == null) {
                throw new AppException("Payment not found", ErrorCode.NOT_FOUND.getCode());
            }

            payment.setExternalReference(captureId);
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaidAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());

            Map<String, Object> gatewayResponse = payment.getGatewayResponseMap();
            gatewayResponse.put("capture_id", captureId);
            gatewayResponse.put("captured_at", LocalDateTime.now().toString());
            payment.setGatewayResponseObject(gatewayResponse);

            payment = paymentRepository.update(payment);

            Order order = orderRepository.getById(payment.getOrderId());
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.update(order);
                log.info("Order {} status updated to PROCESSING", order.getId());
            }

            log.info("PayPal payment captured for order {}: captureId={}", payment.getOrderId(), captureId);

            return PayPalCaptureResponse.builder()
                    .captureId(captureId)
                    .status("COMPLETED")
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .build();

        } catch (Exception e) {
            log.error("Failed to capture PayPal payment: {}", e.getMessage(), e);
            throw new AppException("Failed to capture PayPal payment: " + e.getMessage(),
                    ErrorCode.INTERNAL_ERROR.getCode());
        }
    }

    @Transactional
    public PayPalRefundResponse refundPayment(PayPalRefundRequest request) {
        try {
            String accessToken = getAccessToken();
            String refundId = refundPayPalCapture(accessToken, request);

            Payment payment = paymentRepository.findByExternalReference(request.getCaptureId());
            if (payment == null) {
                throw new AppException("Payment not found", ErrorCode.NOT_FOUND.getCode());
            }

            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            payment.setUpdatedAt(LocalDateTime.now());

            Map<String, Object> gatewayResponse = payment.getGatewayResponseMap();
            gatewayResponse.put("refund_id", refundId);
            gatewayResponse.put("refunded_at", LocalDateTime.now().toString());
            gatewayResponse.put("refund_amount", request.getAmount());
            gatewayResponse.put("refund_note", request.getNote());
            payment.setGatewayResponseObject(gatewayResponse);

            payment = paymentRepository.update(payment);

            log.info("PayPal payment refunded: captureId={}, refundId={}", request.getCaptureId(), refundId);

            return PayPalRefundResponse.builder()
                    .refundId(refundId)
                    .status("COMPLETED")
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .build();

        } catch (Exception e) {
            log.error("Failed to refund PayPal payment: {}", e.getMessage(), e);
            throw new AppException("Failed to refund PayPal payment: " + e.getMessage(),
                    ErrorCode.INTERNAL_ERROR.getCode());
        }
    }

    private synchronized String getAccessToken() throws Exception {
        if (cachedAccessToken != null && System.currentTimeMillis() < tokenExpiryTime) {
            return cachedAccessToken;
        }

        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        RequestBody body = new FormBody.Builder()
                .add("grant_type", "client_credentials")
                .build();

        Request request = new Request.Builder()
                .url(baseUrl + "/v1/oauth2/token")
                .addHeader("Authorization", "Basic " + encodedAuth)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to get PayPal access token: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            cachedAccessToken = jsonResponse.get("access_token").asText();
            int expiresIn = jsonResponse.get("expires_in").asInt();
            tokenExpiryTime = System.currentTimeMillis() + (expiresIn - 60) * 1000L;

            return cachedAccessToken;
        }
    }

    private String createPayPalOrder(String accessToken, Order order, PayPalCreatePaymentRequest request) throws Exception {
        Map<String, Object> orderRequest = new HashMap<>();
        orderRequest.put("intent", "CAPTURE");

        Map<String, Object> purchaseUnit = new HashMap<>();
        Map<String, Object> amount = new HashMap<>();
        amount.put("currency_code", "USD");
        amount.put("value", String.format("%.2f", order.getTotalPrice()));
        purchaseUnit.put("amount", amount);
        purchaseUnit.put("description", "Payment for order " + order.getCode());
        purchaseUnit.put("reference_id", order.getCode());
        
        orderRequest.put("purchase_units", new Object[]{purchaseUnit});

        Map<String, Object> applicationContext = new HashMap<>();
        if (request.getReturnUrl() != null) {
            applicationContext.put("return_url", request.getReturnUrl());
        }
        if (request.getCancelUrl() != null) {
            applicationContext.put("cancel_url", request.getCancelUrl());
        }
        orderRequest.put("application_context", applicationContext);

        String jsonBody = objectMapper.writeValueAsString(orderRequest);

        RequestBody body = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json")
        );

        Request httpRequest = new Request.Builder()
                .url(baseUrl + "/v2/checkout/orders")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(httpRequest).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("PayPal order creation error: {} - {}", response.code(), errorBody);
                throw new RuntimeException("PayPal API returned error: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            return jsonResponse.get("id").asText();
        }
    }

    private String getApprovalUrl(String accessToken, String paypalOrderId) throws Exception {
        Request request = new Request.Builder()
                .url(baseUrl + "/v2/checkout/orders/" + paypalOrderId)
                .addHeader("Authorization", "Bearer " + accessToken)
                .get()
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Failed to get PayPal order details: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            JsonNode links = jsonResponse.get("links");
            if (links != null && links.isArray()) {
                for (JsonNode link : links) {
                    if ("approve".equals(link.get("rel").asText())) {
                        return link.get("href").asText();
                    }
                }
            }
            
            return baseUrl + "/checkoutnow?token=" + paypalOrderId;
        }
    }

    private String capturePayPalOrder(String accessToken, String paypalOrderId) throws Exception {
        RequestBody body = RequestBody.create(
                "{}",
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(baseUrl + "/v2/checkout/orders/" + paypalOrderId + "/capture")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("PayPal capture error: {} - {}", response.code(), errorBody);
                throw new RuntimeException("PayPal capture API returned error: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            JsonNode purchaseUnits = jsonResponse.get("purchase_units");
            if (purchaseUnits != null && purchaseUnits.isArray() && purchaseUnits.size() > 0) {
                JsonNode captures = purchaseUnits.get(0).get("payments").get("captures");
                if (captures != null && captures.isArray() && captures.size() > 0) {
                    return captures.get(0).get("id").asText();
                }
            }
            
            throw new RuntimeException("Capture ID not found in PayPal response");
        }
    }

    private String refundPayPalCapture(String accessToken, PayPalRefundRequest refundRequest) throws Exception {
        Map<String, Object> refundBody = new HashMap<>();
        
        if (refundRequest.getAmount() != null) {
            Map<String, Object> amount = new HashMap<>();
            amount.put("currency_code", refundRequest.getCurrency() != null ? refundRequest.getCurrency() : "USD");
            amount.put("value", String.format("%.2f", refundRequest.getAmount()));
            refundBody.put("amount", amount);
        }
        
        if (refundRequest.getNote() != null) {
            refundBody.put("note_to_payer", refundRequest.getNote());
        }

        String jsonBody = objectMapper.writeValueAsString(refundBody);

        RequestBody body = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json")
        );

        Request request = new Request.Builder()
                .url(baseUrl + "/v2/payments/captures/" + refundRequest.getCaptureId() + "/refund")
                .addHeader("Authorization", "Bearer " + accessToken)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                log.error("PayPal refund error: {} - {}", response.code(), errorBody);
                throw new RuntimeException("PayPal refund API returned error: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            return jsonResponse.get("id").asText();
        }
    }

    public Payment getPaymentByOrderId(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}
