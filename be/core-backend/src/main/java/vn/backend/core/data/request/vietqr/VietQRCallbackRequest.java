package vn.backend.core.data.request.vietqr;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class VietQRCallbackRequest {
    String transactionId;
    String externalReference;
    Double amount;
    String currency;
    String status;
    String description;
    String signature;
}
