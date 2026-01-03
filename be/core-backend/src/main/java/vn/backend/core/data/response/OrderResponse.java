package vn.backend.core.data.response;

import lombok.Data;
import vn.backend.entity.data.mysql.Order;
import vn.backend.entity.data.mysql.OrderItem;

import java.util.List;

@Data
public class OrderResponse extends Order {
    private List<OrderItem> items;
}
