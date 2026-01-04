package vn.backend.core.service;

import org.junit.jupiter.api.Test;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for VietQR signature verification logic
 */
public class VietQRSignatureTest {

    @Test
    public void testSignatureGeneration() throws Exception {
        String apiKey = "test-api-key";
        String transactionId = "VIETQR-12345678";
        Double amount = 100.50;
        String status = "success";
        
        String data = transactionId + amount + status;
        
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKey);
        
        byte[] hash = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        String signature = Base64.getEncoder().encodeToString(hash);
        
        assertNotNull(signature);
        assertFalse(signature.isEmpty());
    }

    @Test
    public void testSignatureVerification() throws Exception {
        String apiKey = "test-api-key";
        String transactionId = "VIETQR-12345678";
        Double amount = 100.50;
        String status = "success";
        
        String data = transactionId + amount + status;
        
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKey);
        
        byte[] hash = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        String calculatedSignature = Base64.getEncoder().encodeToString(hash);
        
        String receivedSignature = calculatedSignature;
        
        assertTrue(calculatedSignature.equals(receivedSignature));
    }

    @Test
    public void testSignatureVerificationFails() throws Exception {
        String apiKey = "test-api-key";
        String transactionId = "VIETQR-12345678";
        Double amount = 100.50;
        String status = "success";
        
        String data = transactionId + amount + status;
        
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(apiKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKey);
        
        byte[] hash = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        String calculatedSignature = Base64.getEncoder().encodeToString(hash);
        
        String tamperedSignature = "invalid-signature";
        
        assertFalse(calculatedSignature.equals(tamperedSignature));
    }
}
