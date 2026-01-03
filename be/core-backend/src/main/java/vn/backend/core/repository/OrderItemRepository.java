package vn.backend.core.repository;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.entity.data.mysql.OrderItem;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.OrderItems.ORDER_ITEMS;

@Repository
public class OrderItemRepository {

    @Autowired
    private DSLContext dsl;

    // ==============================
    //           FIELDS
    // ==============================
    private static List<Field<?>> getFields() {
        return asList(
                ORDER_ITEMS.ID,
                ORDER_ITEMS.ORDER_ID,
                ORDER_ITEMS.PRODUCT_ID,
                ORDER_ITEMS.PRODUCT_NAME,
                ORDER_ITEMS.UNIT_PRICE,
                ORDER_ITEMS.QUANTITY,
                ORDER_ITEMS.CREATED_AT,
                ORDER_ITEMS.UPDATED_AT
        );
    }

    // ==============================
    //     FIND BY ORDER ID
    // ==============================
    public List<OrderItem> findByOrderId(Integer orderId) {
        return dsl.select(getFields())
                .from(ORDER_ITEMS)
                .where(ORDER_ITEMS.ORDER_ID.eq(orderId))
                .fetchInto(OrderItem.class);
    }

    // ==============================
    //          GET BY ID
    // ==============================
    public OrderItem getById(Integer id) {
        return dsl.select(getFields())
                .from(ORDER_ITEMS)
                .where(ORDER_ITEMS.ID.eq(id))
                .fetchOptionalInto(OrderItem.class)
                .orElse(null);
    }

    // ==============================
    //          INSERT
    // ==============================
    public OrderItem insert(OrderItem item) {
        dsl.insertInto(ORDER_ITEMS)
                .set(ORDER_ITEMS.ORDER_ID, item.getOrderId())
                .set(ORDER_ITEMS.PRODUCT_ID, item.getProductId())
                .set(ORDER_ITEMS.PRODUCT_NAME, item.getProductName())
                .set(ORDER_ITEMS.UNIT_PRICE, item.getUnitPrice())
                .set(ORDER_ITEMS.QUANTITY, item.getQuantity())
                .execute();

        item.setId(dsl.lastID().intValue());
        return item;
    }

    // ==============================
    //       BATCH INSERT
    // ==============================
    public void batchInsert(List<OrderItem> items) {
        if (items == null || items.isEmpty()) {
            return;
        }

        var insert = dsl.insertInto(ORDER_ITEMS,
                ORDER_ITEMS.ORDER_ID,
                ORDER_ITEMS.PRODUCT_ID,
                ORDER_ITEMS.PRODUCT_NAME,
                ORDER_ITEMS.UNIT_PRICE,
                ORDER_ITEMS.QUANTITY
        );

        for (OrderItem item : items) {
            insert = insert.values(
                    item.getOrderId(),
                    item.getProductId(),
                    item.getProductName(),
                    item.getUnitPrice(),
                    item.getQuantity()
            );
        }

        insert.execute();
    }

    // ==============================
    //          UPDATE
    // ==============================
    public OrderItem update(OrderItem item) {
        dsl.update(ORDER_ITEMS)
                .set(ORDER_ITEMS.PRODUCT_ID, item.getProductId())
                .set(ORDER_ITEMS.PRODUCT_NAME, item.getProductName())
                .set(ORDER_ITEMS.UNIT_PRICE, item.getUnitPrice())
                .set(ORDER_ITEMS.QUANTITY, item.getQuantity())
                .where(ORDER_ITEMS.ID.eq(item.getId()))
                .execute();

        return item;
    }

    // ==============================
    //     DELETE BY ORDER ID
    // ==============================
    public Integer deleteByOrderId(Integer orderId) {
        return dsl.deleteFrom(ORDER_ITEMS)
                .where(ORDER_ITEMS.ORDER_ID.eq(orderId))
                .execute();
    }

    // ==============================
    //          DELETE
    // ==============================
    public Integer delete(Integer id) {
        return dsl.deleteFrom(ORDER_ITEMS)
                .where(ORDER_ITEMS.ID.eq(id))
                .execute();
    }

    // ==============================
    //    CALCULATE TOTAL AMOUNT
    // ==============================
    public Double calculateTotalAmount(Integer orderId) {
        return dsl.select(
                        ORDER_ITEMS.UNIT_PRICE.multiply(ORDER_ITEMS.QUANTITY).sum()
                )
                .from(ORDER_ITEMS)
                .where(ORDER_ITEMS.ORDER_ID.eq(orderId))
                .fetchOne(0, Double.class);
    }
}