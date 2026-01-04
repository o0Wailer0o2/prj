package vn.backend.core.data.request.paypal;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class PayPalRefundRequest {
    String captureId;
    Double amount;
    String currency;
    String note;
}
