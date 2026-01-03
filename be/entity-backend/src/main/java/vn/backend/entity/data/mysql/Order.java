package vn.backend.entity.data.mysql;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import vn.backend.entity.data.constant.OrderStatus;

import java.util.HashSet;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order extends BaseEntity {
    Integer id;

    String code;

    Integer userId;
    String userFullName;
    String userEmail;
    String userPhoneNumber;

    String shippingStreet;
    String shippingCity;
    String shippingDistrict;
    String shippingCountry;
    String shippingZip;
    String shippingNumber;

    Double tax;
    Double deliveryFee;
    Double discount; // (0 - 100) %

    Double totalPrice;

    OrderStatus status;

    String orderNotes;

    Set<Integer> orderItemIds = new HashSet<>();
}
