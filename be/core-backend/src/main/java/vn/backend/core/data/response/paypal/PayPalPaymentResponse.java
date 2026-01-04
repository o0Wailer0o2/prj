package vn.backend.core.data.response.paypal;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PayPalPaymentResponse {
    String orderId;
    String approvalUrl;
    String status;
}
