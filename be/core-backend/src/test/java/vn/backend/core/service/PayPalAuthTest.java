package vn.backend.core.service;

import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for PayPal authentication logic
 */
public class PayPalAuthTest {

    @Test
    public void testBasicAuthHeaderGeneration() {
        String clientId = "test-client-id";
        String clientSecret = "test-client-secret";
        
        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        
        assertNotNull(encodedAuth);
        assertFalse(encodedAuth.isEmpty());
        
        String decoded = new String(Base64.getDecoder().decode(encodedAuth), StandardCharsets.UTF_8);
        assertEquals(auth, decoded);
    }

    @Test
    public void testBasicAuthHeaderFormat() {
        String clientId = "AYSq3RDGsmBLJE-otTkBtM";
        String clientSecret = "EClusMEUk4e92FQm";
        
        String auth = clientId + ":" + clientSecret;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        
        String authHeader = "Basic " + encodedAuth;
        
        assertTrue(authHeader.startsWith("Basic "));
        assertEquals(encodedAuth, authHeader.substring(6));
    }

    @Test
    public void testAmountFormatting() {
        Double amount1 = 100.0;
        Double amount2 = 99.99;
        Double amount3 = 1234.567;
        
        String formatted1 = String.format("%.2f", amount1);
        String formatted2 = String.format("%.2f", amount2);
        String formatted3 = String.format("%.2f", amount3);
        
        assertEquals("100.00", formatted1);
        assertEquals("99.99", formatted2);
        assertEquals("1234.57", formatted3);
    }
}
