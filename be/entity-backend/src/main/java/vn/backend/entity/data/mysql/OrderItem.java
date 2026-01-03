package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderItem extends BaseEntity {
    Integer id;

    Integer orderId;

    Integer productId;

    String productName;

    Double unitPrice;

    Integer quantity;
}
