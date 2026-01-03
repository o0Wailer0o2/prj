package vn.backend.core.data.request;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import vn.backend.entity.data.mysql.Order;
import vn.backend.entity.data.mysql.OrderItem;

import java.util.List;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class CreateOrderRequest {
    Order order;
    List<OrderItem> orderItems;
}
