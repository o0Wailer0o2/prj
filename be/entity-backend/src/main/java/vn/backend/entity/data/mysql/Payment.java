package vn.backend.entity.data.mysql;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment extends BaseEntity {
    Integer id;
    Integer orderId;

    // Generic fields - works for any payment gateway
    String transactionId;        // Main ID from gateway (Stripe: session_id, PayPal: order_id, Momo: requestId)
    String externalReference;    // Secondary ID (Stripe: payment_intent_id, PayPal: capture_id)
    String gatewayResponse;      // Full JSON response for debugging/reconciliation

    Double amount;

    @Builder.Default
    String currency = "USD";

    @Builder.Default
    PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Builder.Default
    PaymentStatus paymentStatus = PaymentStatus.PENDING;

    LocalDateTime paidAt;

    String metadata; // Additional info as JSON

    /**
     * Set gateway response from object (auto convert to JSON)
     */
    public void setGatewayResponseObject(Object response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.gatewayResponse = mapper.writeValueAsString(response);
        } catch (JsonProcessingException e) {
            this.gatewayResponse = response.toString();
        }
    }

    /**
     * Get gateway response as Map
     */
    public Map<String, Object> getGatewayResponseMap() {
        if (gatewayResponse == null || gatewayResponse.isEmpty()) {
            return new HashMap<>();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(gatewayResponse, Map.class);
        } catch (JsonProcessingException e) {
            return new HashMap<>();
        }
    }

    /**
     * Set metadata from Map (auto convert to JSON)
     */
    public void setMetadataMap(Map<String, Object> metadataMap) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.metadata = mapper.writeValueAsString(metadataMap);
        } catch (JsonProcessingException e) {
            this.metadata = metadataMap.toString();
        }
    }

    /**
     * Get metadata as Map
     */
    public Map<String, Object> getMetadataMap() {
        if (metadata == null || metadata.isEmpty()) {
            return new HashMap<>();
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(metadata, Map.class);
        } catch (JsonProcessingException e) {
            return new HashMap<>();
        }
    }
}
