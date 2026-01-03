package vn.backend.core.data.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class StripeCreatePaymentRequest {
    @NotNull
    Integer orderId;

    @NotNull
    String returnUrl;
}