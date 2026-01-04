package vn.backend.core.data.response.vietqr;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VietQRResponse {
    String qrCode;
    String qrDataURL;
    String transactionId;
    Double amount;
    String description;
}
