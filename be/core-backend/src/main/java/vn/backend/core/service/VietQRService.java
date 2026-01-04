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
import vn.backend.core.data.request.vietqr.VietQRCallbackRequest;
import vn.backend.core.data.request.vietqr.VietQRCreatePaymentRequest;
import vn.backend.core.data.response.vietqr.VietQRResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.OrderRepository;
import vn.backend.core.repository.PaymentRepository;
import vn.backend.entity.data.constant.OrderStatus;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.Order;
import vn.backend.entity.data.mysql.Payment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VietQRService {
    
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${vietqr.api-url}")
    private String apiUrl;

    @Value("${vietqr.client-id}")
    private String clientId;

    @Value("${vietqr.api-key}")
    private String apiKey;

    @Transactional
    public VietQRResponse createPaymentFromOrder(VietQRCreatePaymentRequest request) {
        Order order = orderRepository.getById(request.getOrderId());
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        Payment existingPayment = paymentRepository.findByOrderId(order.getId());
        if (existingPayment != null && existingPayment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new AppException("Payment has already been completed for this order", ErrorCode.BAD_REQUEST.getCode());
        }

        String transactionId = generateTransactionId();
        String description = "Payment for order " + order.getCode();

        try {
            String qrData = generateQRCode(
                    transactionId,
                    order.getTotalPrice(),
                    description
            );

            Payment payment;
            if (existingPayment != null) {
                existingPayment.setTransactionId(transactionId);
                existingPayment.setPaymentStatus(PaymentStatus.PENDING);
                existingPayment.setUpdatedAt(LocalDateTime.now());
                Map<String, Object> gatewayResponse = new HashMap<>();
                gatewayResponse.put("qr_data", qrData);
                gatewayResponse.put("transaction_id", transactionId);
                existingPayment.setGatewayResponseObject(gatewayResponse);
                payment = paymentRepository.update(existingPayment);
            } else {
                payment = Payment.builder()
                        .orderId(order.getId())
                        .transactionId(transactionId)
                        .amount(order.getTotalPrice())
                        .currency("VND")
                        .paymentMethod(PaymentMethod.vietQR)
                        .paymentStatus(PaymentStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                Map<String, Object> gatewayResponse = new HashMap<>();
                gatewayResponse.put("qr_data", qrData);
                gatewayResponse.put("transaction_id", transactionId);
                payment.setGatewayResponseObject(gatewayResponse);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("user_id", order.getUserId());
                metadata.put("user_email", order.getUserEmail());
                metadata.put("order_code", order.getCode());
                if (request.getReturnUrl() != null) {
                    metadata.put("return_url", request.getReturnUrl());
                }
                payment.setMetadataMap(metadata);

                payment = paymentRepository.insert(payment);
            }

            log.info("VietQR payment initiated for order {}: transactionId={}", order.getId(), transactionId);

            return VietQRResponse.builder()
                    .qrCode(qrData)
                    .qrDataURL(qrData)
                    .transactionId(transactionId)
                    .amount(order.getTotalPrice())
                    .description(description)
                    .build();

        } catch (Exception e) {
            log.error("Failed to create VietQR payment: {}", e.getMessage(), e);
            throw new AppException("Failed to create VietQR payment: " + e.getMessage(),
                    ErrorCode.INTERNAL_ERROR.getCode());
        }
    }

    private String generateQRCode(String transactionId, Double amount, String description) throws Exception {
        Map<String, Object> qrRequest = new HashMap<>();
        qrRequest.put("accountNo", "1234567890");
        qrRequest.put("accountName", "MERCHANT NAME");
        qrRequest.put("acqId", "970415");
        qrRequest.put("amount", amount.intValue());
        qrRequest.put("addInfo", description);
        qrRequest.put("format", "text");
        qrRequest.put("template", "compact");

        String jsonBody = objectMapper.writeValueAsString(qrRequest);

        RequestBody body = RequestBody.create(
                jsonBody,
                MediaType.parse("application/json")
        );

        Request httpRequest = new Request.Builder()
                .url(apiUrl + "/v2/generate")
                .addHeader("x-client-id", clientId)
                .addHeader("x-api-key", apiKey)
                .addHeader("Content-Type", "application/json")
                .post(body)
                .build();

        try (Response response = httpClient.newCall(httpRequest).execute()) {
            if (!response.isSuccessful()) {
                log.error("VietQR API error: {}", response.code());
                throw new RuntimeException("VietQR API returned error: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonResponse = objectMapper.readTree(responseBody);
            
            if (jsonResponse.has("data") && jsonResponse.get("data").has("qrDataURL")) {
                return jsonResponse.get("data").get("qrDataURL").asText();
            } else if (jsonResponse.has("data") && jsonResponse.get("data").has("qrCode")) {
                return jsonResponse.get("data").get("qrCode").asText();
            }
            
            return responseBody;
        }
    }

    @Transactional
    public String handleCallback(VietQRCallbackRequest callback) {
        log.info("Received VietQR callback: transactionId={}, status={}", 
                callback.getTransactionId(), callback.getStatus());

        if (!verifySignature(callback)) {
            log.warn("VietQR callback signature verification failed");
            return "Signature verification failed";
        }

        Payment payment = paymentRepository.findByTransactionId(callback.getTransactionId());
        if (payment == null) {
            if (callback.getExternalReference() != null) {
                payment = paymentRepository.findByExternalReference(callback.getExternalReference());
            }
        }

        if (payment == null) {
            log.warn("Payment not found for VietQR callback: transactionId={}", callback.getTransactionId());
            return "Payment not found";
        }

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment already completed: {}", payment.getId());
            return "Payment already processed";
        }

        if (!validateAmount(payment, callback.getAmount())) {
            log.error("Amount mismatch for payment {}: expected={}, received={}", 
                    payment.getId(), payment.getAmount(), callback.getAmount());
            return "Amount mismatch";
        }

        if ("success".equalsIgnoreCase(callback.getStatus()) || "completed".equalsIgnoreCase(callback.getStatus())) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setExternalReference(callback.getExternalReference());
            payment.setPaidAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setGatewayResponseObject(callback);
            paymentRepository.update(payment);

            Order order = orderRepository.getById(payment.getOrderId());
            if (order != null && order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.PROCESSING);
                orderRepository.update(order);
                log.info("Order {} status updated to PROCESSING", order.getId());
            }

            log.info("VietQR payment completed for order {}", payment.getOrderId());
            return "Payment completed successfully";
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setUpdatedAt(LocalDateTime.now());
            payment.setGatewayResponseObject(callback);
            paymentRepository.update(payment);
            
            log.warn("VietQR payment failed for order {}: status={}", payment.getOrderId(), callback.getStatus());
            return "Payment failed";
        }
    }

    private boolean verifySignature(VietQRCallbackRequest callback) {
        if (callback.getSignature() == null || callback.getSignature().isEmpty()) {
            log.warn("VietQR callback received without signature - rejecting");
            return false;
        }

        try {
            String data = callback.getTransactionId() + 
                         callback.getAmount() + 
                         callback.getStatus();
            
            Mac hmacSha256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmacSha256.init(secretKey);
            
            byte[] hash = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String calculatedSignature = Base64.getEncoder().encodeToString(hash);
            
            return calculatedSignature.equals(callback.getSignature());
        } catch (Exception e) {
            log.error("Error verifying VietQR signature: {}", e.getMessage());
            return false;
        }
    }

    private boolean validateAmount(Payment payment, Double callbackAmount) {
        if (payment.getAmount() == null || callbackAmount == null) {
            return false;
        }
        return Math.abs(payment.getAmount() - callbackAmount) < 0.01;
    }

    private String generateTransactionId() {
        return "VIETQR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public Payment getPaymentByOrderId(Integer orderId) {
        return paymentRepository.findByOrderId(orderId);
    }
}
