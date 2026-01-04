package vn.backend.core.data.request.paypal;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class PayPalCreatePaymentRequest {
    @NotNull
    Integer orderId;
    
    String returnUrl;
    String cancelUrl;
}
