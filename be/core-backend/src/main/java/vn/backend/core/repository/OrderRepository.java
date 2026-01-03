package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.data.request.OrderFilterRequest;
import vn.backend.core.data.request.ProductFilterRequest;
import vn.backend.core.util.CommonUtils;
import vn.backend.entity.data.constant.OrderStatus;
import vn.backend.entity.data.mysql.Order;

import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Orders.ORDERS;
import static vn.entity.backend.tables.Products.PRODUCTS;

@Repository
public class OrderRepository {

    @Autowired
    private DSLContext dsl;

    // ==============================
    //           FIELDS
    // ==============================
    private static List<Field<?>> getFields() {
        return asList(
                ORDERS.ID,
                ORDERS.CODE,
                ORDERS.USER_ID,
                ORDERS.USER_FULL_NAME,
                ORDERS.USER_EMAIL,
                ORDERS.USER_PHONE_NUMBER,
                ORDERS.SHIPPING_STREET,
                ORDERS.SHIPPING_CITY,
                ORDERS.SHIPPING_DISTRICT,
                ORDERS.SHIPPING_COUNTRY,
                ORDERS.SHIPPING_ZIP,
                ORDERS.SHIPPING_NUMBER,
                ORDERS.TAX,
                ORDERS.DELIVERY_FEE,
                ORDERS.DISCOUNT,
                ORDERS.TOTAL_PRICE,
                ORDERS.STATUS,
                ORDERS.ORDER_NOTES,
                ORDERS.CREATED_AT,
                ORDERS.UPDATED_AT
        );
    }

    // ==============================
    //       WHERE CONDITION
    // ==============================
    private Condition getWhereCondition(String keyword, List<OrderStatus> statuses, int userId) {
        Condition condition = DSL.trueCondition();

        if(userId > 0) {
            condition = condition.and(ORDERS.USER_ID.eq(userId));
        }

        if (!CommonUtils.NVL(keyword).isEmpty()) {
            String kw = "%" + keyword.toLowerCase() + "%";
            condition = condition.and(
                    DSL.lower(ORDERS.CODE).like(kw)
                            .or(DSL.lower(ORDERS.USER_FULL_NAME).like(kw))
                            .or(DSL.lower(ORDERS.USER_EMAIL).like(kw))
            );
        }

        if (statuses != null && !statuses.isEmpty()) {
            condition = condition.and(
                    ORDERS.STATUS.in(
                            statuses.stream()
                                    .map(Enum::name)
                                    .toList()
                    )
            );
        }

        return condition;
    }

    private List<OrderField<?>> buildOrderBy(OrderFilterRequest filter) {
        String sortBy = filter != null ? filter.getSortBy() : null;
        String sortDir = filter != null ? filter.getSortDir() : null;

        if (CommonUtils.NVL(sortBy).isEmpty()) {
            return List.of(ORDERS.ID.desc());
        }

        Field<?> sortField = switch (sortBy) {
            case "userFullName" -> ORDERS.USER_FULL_NAME;
            case "userEmail" -> ORDERS.USER_EMAIL;
            case "totalPrice" -> ORDERS.TOTAL_PRICE;
            case "status" -> ORDERS.STATUS;
            case "createdAt" -> ORDERS.CREATED_AT;
            default -> ORDERS.ID;
        };

        boolean isDesc = "desc".equalsIgnoreCase(sortDir);
        return List.of(isDesc ? sortField.desc() : sortField.asc());
    }

    // ==============================
    //            LIST
    // ==============================
    public List<Order> getByCriteria(OrderFilterRequest filter, Pageable pageable) {
        Condition condition = getWhereCondition(filter.getKeyword(), filter.getStatus(), filter.getUserId());
        List<OrderField<?>> orderBy = buildOrderBy(filter);

        SelectConditionStep<Record> query = (SelectConditionStep<Record>) dsl.select(getFields())
                .from(ORDERS)
                .where(condition)
                .orderBy(orderBy);

        return dsl.select(getFields())
                .from(ORDERS)
                .where(condition)
                .orderBy(orderBy)
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(Order.class);
    }

    public Long countByCriteria(OrderFilterRequest filter) {
        Condition condition = getWhereCondition(filter.getKeyword(), filter.getStatus(), filter.getUserId());

        return dsl.selectCount()
                .from(ORDERS)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    // ==============================
    //          GET BY ID
    // ==============================
    public Order getById(Integer id) {
        return dsl.select(getFields())
                .from(ORDERS)
                .where(ORDERS.ID.eq(id))
                .fetchOptionalInto(Order.class)
                .orElse(null);
    }

    // ==============================
    //          INSERT
    // ==============================
    public Order insert(Order o) {
        dsl.insertInto(ORDERS)
                .set(ORDERS.CODE, o.getCode())
                .set(ORDERS.USER_ID, o.getUserId())
                .set(ORDERS.USER_FULL_NAME, o.getUserFullName())
                .set(ORDERS.USER_EMAIL, o.getUserEmail())
                .set(ORDERS.USER_PHONE_NUMBER, o.getUserPhoneNumber())
                .set(ORDERS.SHIPPING_STREET, o.getShippingStreet())
                .set(ORDERS.SHIPPING_CITY, o.getShippingCity())
                .set(ORDERS.SHIPPING_DISTRICT, o.getShippingDistrict())
                .set(ORDERS.SHIPPING_COUNTRY, o.getShippingCountry())
                .set(ORDERS.SHIPPING_ZIP, o.getShippingZip())
                .set(ORDERS.SHIPPING_NUMBER, o.getShippingNumber())
                .set(ORDERS.TAX, o.getTax())
                .set(ORDERS.DELIVERY_FEE, o.getDeliveryFee())
                .set(ORDERS.DISCOUNT, o.getDiscount())
                .set(ORDERS.TOTAL_PRICE, o.getTotalPrice())
                .set(ORDERS.STATUS, o.getStatus() != null ? o.getStatus().name() : null)
                .set(ORDERS.ORDER_NOTES, o.getOrderNotes())
                .execute();

        o.setId(dsl.lastID().intValue());
        return o;
    }

    // ==============================
    //          UPDATE
    // ==============================
    public Order update(Order o) {
        dsl.update(ORDERS)
                .set(ORDERS.CODE, o.getCode())
                .set(ORDERS.USER_ID, o.getUserId())
                .set(ORDERS.USER_FULL_NAME, o.getUserFullName())
                .set(ORDERS.USER_EMAIL, o.getUserEmail())
                .set(ORDERS.USER_PHONE_NUMBER, o.getUserPhoneNumber())
                .set(ORDERS.SHIPPING_STREET, o.getShippingStreet())
                .set(ORDERS.SHIPPING_CITY, o.getShippingCity())
                .set(ORDERS.SHIPPING_DISTRICT, o.getShippingDistrict())
                .set(ORDERS.SHIPPING_COUNTRY, o.getShippingCountry())
                .set(ORDERS.SHIPPING_ZIP, o.getShippingZip())
                .set(ORDERS.SHIPPING_NUMBER, o.getShippingNumber())
                .set(ORDERS.TAX, o.getTax())
                .set(ORDERS.DELIVERY_FEE, o.getDeliveryFee())
                .set(ORDERS.DISCOUNT, o.getDiscount())
                .set(ORDERS.TOTAL_PRICE, o.getTotalPrice())
                .set(ORDERS.STATUS, o.getStatus().name())
                .set(ORDERS.ORDER_NOTES, o.getOrderNotes())
                .where(ORDERS.ID.eq(o.getId()))
                .execute();

        return o;
    }

    // ==============================
    //          DELETE
    // ==============================
    public Integer delete(Integer id) {
        return dsl.deleteFrom(ORDERS)
                .where(ORDERS.ID.eq(id))
                .execute();
    }
}
