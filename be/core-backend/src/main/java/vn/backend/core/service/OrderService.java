package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.constant.ErrorCode;
import vn.backend.core.data.request.CreateOrderRequest;
import vn.backend.core.data.request.OrderFilterRequest;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.data.response.OrderResponse;
import vn.backend.core.exception.AppException;
import vn.backend.core.repository.OrderItemRepository;
import vn.backend.core.repository.OrderRepository;
import vn.backend.core.repository.ProductRepository;
import vn.backend.entity.data.constant.OrderStatus;
import vn.backend.entity.data.mysql.Order;
import vn.backend.entity.data.mysql.OrderItem;
import vn.backend.entity.data.mysql.Product;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public Page<Order> getList(OrderFilterRequest filter, Pageable pageable) {
        CompletableFuture<List<Order>> fuList =
                CompletableFuture.supplyAsync(() ->
                        orderRepository.getByCriteria(filter, pageable)
                );

        CompletableFuture<Long> fuCount =
                CompletableFuture.supplyAsync(() ->
                        orderRepository.countByCriteria(filter)
                );

        List<Order> list = fuList.join();
        Long count = fuCount.join();

        pageable.setTotal(count);
        return new Page<>(pageable, list);
    }

    @Transactional
    public Order create(CreateOrderRequest request) {
        Order order = request.getOrder();
        List<OrderItem> orderItems = request.getOrderItems();

        // Validate
        if (orderItems == null || orderItems.isEmpty()) {
            throw new AppException("Order must have at least one item", ErrorCode.BAD_REQUEST.getCode());
        }

        // Generate order code
        order.setCode(generateOrderCode());

        // Set default status
        if (order.getStatus() == null) {
            order.setStatus(OrderStatus.PENDING);
        }

        // Validate và tính toán giá
        validateAndCalculateOrderItems(orderItems);

        // ==============================
        // QUAN TRỌNG: Trừ stock sản phẩm
        // ==============================
        deductProductStocks(orderItems);

        // Tính toán tổng giá
        Double subtotal = calculateSubtotal(orderItems);
        Double tax = order.getTax() != null ? order.getTax() : 0.0;
        Double deliveryFee = order.getDeliveryFee() != null ? order.getDeliveryFee() : 0.0;
        Double discount = order.getDiscount() != null ? order.getDiscount() : 0.0;

        // Tính giá cuối cùng
        Double totalPrice = calculateTotalPrice(subtotal, tax, deliveryFee, discount);
        order.setTotalPrice(totalPrice);

        // Lưu order
        Order savedOrder = orderRepository.insert(order);

        // Lưu order items
        Set<Integer> itemIds = new HashSet<>();
        for (OrderItem item : orderItems) {
            item.setOrderId(savedOrder.getId());
            OrderItem savedItem = orderItemRepository.insert(item);
            itemIds.add(savedItem.getId());
        }

        savedOrder.setOrderItemIds(itemIds);

        log.info("Order created successfully: {} with {} items. Stock deducted for all products.",
                savedOrder.getCode(), orderItems.size());

        return savedOrder;
    }

    public OrderResponse getById(Integer id) {
        Order order = orderRepository.getById(id);
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        // Load order items
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
        OrderResponse response = new OrderResponse();
        BeanUtils.copyProperties(order, response);
        response.setItems(orderItems);

        return response;
    }

    @Transactional
    public Order update(Order order) {
        Order existingOrder = orderRepository.getById(order.getId());
        if (existingOrder == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }
        return orderRepository.update(order);
    }

    @Transactional
    public Integer delete(Integer id) {
        Order order = orderRepository.getById(id);
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        // ==============================
        // QUAN TRỌNG: Hoàn trả stock khi hủy đơn
        // Chỉ hoàn trả nếu order chưa được giao hoặc chưa hoàn thành
        // ==============================
        if (shouldRestoreStock(order.getStatus())) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderId(id);
            restoreProductStocks(orderItems);
            log.info("Stock restored for order: {}", id);
        }

        // Xóa order items trước
        orderItemRepository.deleteByOrderId(id);

        // Xóa order
        return orderRepository.delete(id);
    }

    // ==============================
    //    CANCEL ORDER (New Method)
    // ==============================
    @Transactional
    public Order cancelOrder(Integer orderId, String reason) {
        Order order = orderRepository.getById(orderId);
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        // Chỉ hủy đơn hàng ở trạng thái PENDING hoặc PROCESSING
        if (!canCancelOrder(order.getStatus())) {
            throw new AppException(
                    String.format("Cannot cancel order with status: %s", order.getStatus()),
                    ErrorCode.BAD_REQUEST.getCode()
            );
        }

        // Hoàn trả stock
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);
        restoreProductStocks(orderItems);

        // Cập nhật trạng thái order
        order.setStatus(OrderStatus.CANCELLED);
        String notes = order.getOrderNotes() != null ?
                order.getOrderNotes() + "\n[CANCELLED: " + reason + "]" :
                "[CANCELLED: " + reason + "]";
        order.setOrderNotes(notes);

        Order updatedOrder = orderRepository.update(order);
        log.info("Order cancelled: {}. Stock restored.", orderId);

        return updatedOrder;
    }

    // ==============================
    //        UPDATE ORDER STATUS
    // ==============================
    @Transactional
    public Order updateOrderStatus(Integer orderId, OrderStatus newStatus) {
        Order order = orderRepository.getById(orderId);
        if (order == null) {
            throw new AppException("Order not found", ErrorCode.NOT_FOUND.getCode());
        }

        OrderStatus oldStatus = order.getStatus();

        // Logic xử lý stock dựa trên trạng thái
        handleStockOnStatusChange(orderId, oldStatus, newStatus);

        // Cập nhật trạng thái
        order.setStatus(newStatus);

        // Ghi log thay đổi
        String notes = order.getOrderNotes() != null ?
                order.getOrderNotes() + "\n[STATUS: " + oldStatus + " -> " + newStatus + "]" :
                "[STATUS: " + oldStatus + " -> " + newStatus + "]";
        order.setOrderNotes(notes);

        return orderRepository.update(order);
    }

    // ==============================
    //     HELPER METHODS (Updated)
    // ==============================

    /**
     * Trừ stock của tất cả sản phẩm trong order
     */
    private void deductProductStocks(List<OrderItem> orderItems) {
        for (OrderItem item : orderItems) {
            int updatedRows = productRepository.deductStock(item.getProductId(), item.getQuantity());

            if (updatedRows == 0) {
                // Rollback transaction tự động khi throw exception
                throw new AppException(
                        String.format("Insufficient stock for product: %s (ID: %d). Available: %d, Requested: %d",
                                item.getProductName(), item.getProductId(),
                                getProductStock(item.getProductId()), item.getQuantity()),
                        ErrorCode.BAD_REQUEST.getCode()
                );
            }

            log.debug("Stock deducted for product {}: -{} units",
                    item.getProductId(), item.getQuantity());
        }
    }

    /**
     * Hoàn trả stock của tất cả sản phẩm trong order
     */
    private void restoreProductStocks(List<OrderItem> orderItems) {
        for (OrderItem item : orderItems) {
            int updatedRows = productRepository.restoreStock(item.getProductId(), item.getQuantity());

            if (updatedRows > 0) {
                log.debug("Stock restored for product {}: +{} units",
                        item.getProductId(), item.getQuantity());
            }
        }
    }

    /**
     * Lấy stock hiện tại của sản phẩm
     */
    private Integer getProductStock(Integer productId) {
        Product product = productRepository.getById(productId);
        return product != null ? product.getStock() : 0;
    }

    /**
     * Kiểm tra xem có nên hoàn trả stock khi xóa/hủy đơn không
     */
    private boolean shouldRestoreStock(OrderStatus status) {
        return Arrays.asList(
                OrderStatus.PENDING,
                OrderStatus.PROCESSING
        ).contains(status);
    }

    /**
     * Kiểm tra xem order có thể bị hủy không
     */
    private boolean canCancelOrder(OrderStatus status) {
        return Arrays.asList(
                OrderStatus.PENDING,
                OrderStatus.PROCESSING
        ).contains(status);
    }

    /**
     * Xử lý stock khi thay đổi trạng thái order
     */
    private void handleStockOnStatusChange(Integer orderId, OrderStatus oldStatus, OrderStatus newStatus) {
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(orderId);

        // Nếu hủy đơn từ trạng thái đã xác nhận -> hoàn trả stock
        if (newStatus == OrderStatus.CANCELLED &&
                (oldStatus == OrderStatus.PENDING || oldStatus == OrderStatus.PROCESSING)) {
            restoreProductStocks(orderItems);
        }

        // Nếu hoàn thành đơn hàng -> không thay đổi stock (đã trừ từ trước)
        if (newStatus == OrderStatus.COMPLETED) {
            log.info("Order {} completed. Stock already deducted.", orderId);
        }

        // Nếu đơn hàng bị trả lại -> hoàn trả stock
        if (newStatus == OrderStatus.RETURNED) {
            restoreProductStocks(orderItems);
        }
    }

    /**
     * Validate order items và fetch product details (Updated)
     */
    private void validateAndCalculateOrderItems(List<OrderItem> orderItems) {
        Set<Integer> processedProductIds = new HashSet<>();

        for (OrderItem item : orderItems) {
            // Validate product exists
            Product product = productRepository.getById(item.getProductId());
            if (product == null) {
                throw new AppException("Product not found: " + item.getProductId(),
                        ErrorCode.NOT_FOUND.getCode());
            }

            // Kiểm tra duplicate product trong order
            if (processedProductIds.contains(item.getProductId())) {
                throw new AppException(
                        "Duplicate product in order: " + product.getName(),
                        ErrorCode.BAD_REQUEST.getCode()
                );
            }
            processedProductIds.add(item.getProductId());

            // Check stock (kiểm tra trước khi trừ)
            if (product.getStock() < item.getQuantity()) {
                throw new AppException(
                        String.format("Insufficient stock for product: %s. Available: %d, Requested: %d",
                                product.getName(), product.getStock(), item.getQuantity()),
                        ErrorCode.BAD_REQUEST.getCode()
                );
            }

            // Set product details
            item.setProductName(product.getName());
            item.setUnitPrice(product.getPrice());

            // Validate quantity
            if (item.getQuantity() <= 0) {
                throw new AppException("Invalid quantity for product: " + product.getName(),
                        ErrorCode.BAD_REQUEST.getCode());
            }
        }
    }

    // Các phương thức khác giữ nguyên...
    private String generateOrderCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private Double calculateSubtotal(List<OrderItem> orderItems) {
        return orderItems.stream()
                .mapToDouble(item -> item.getUnitPrice() * item.getQuantity())
                .sum();
    }

    private Double calculateTotalPrice(Double subtotal, Double tax, Double deliveryFee, Double discount) {
        Double total = subtotal + tax + deliveryFee;

        // Apply discount (percentage)
        if (discount > 0) {
            total = total * (1 - discount / 100.0);
        }

        return Math.round(total * 100.0) / 100.0;
    }
}