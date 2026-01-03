package vn.backend.core.data.request;

import lombok.Data;
import vn.backend.entity.data.constant.OrderStatus;

import java.util.List;

@Data
public class OrderFilterRequest {
    List<OrderStatus> status;
    String keyword;
    int userId;

    String sortBy;
    String sortDir;
}
