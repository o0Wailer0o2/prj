package vn.backend.core.repository;

import org.jooq.*;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.Payment;

import java.time.LocalDateTime;
import java.util.List;

import static java.util.Arrays.asList;
import static vn.entity.backend.tables.Payments.PAYMENTS;

@Repository
public class PaymentRepository {

    @Autowired
    private DSLContext dsl;

    // ==============================
    //           FIELDS
    // ==============================
    private static List<Field<?>> getFields() {
        return asList(
                PAYMENTS.ID,
                PAYMENTS.ORDER_ID,
                PAYMENTS.TRANSACTION_ID,
                PAYMENTS.EXTERNAL_REFERENCE,
                PAYMENTS.GATEWAY_RESPONSE,
                PAYMENTS.AMOUNT,
                PAYMENTS.CURRENCY,
                PAYMENTS.PAYMENT_METHOD,
                PAYMENTS.PAYMENT_STATUS,
                PAYMENTS.PAID_AT,
                PAYMENTS.CREATED_AT,
                PAYMENTS.UPDATED_AT,
                PAYMENTS.METADATA
        );
    }

    // ==============================
    //      WHERE CONDITION
    // ==============================
    private Condition getWhereCondition(PaymentMethod method, PaymentStatus status,
                                        LocalDateTime fromDate, LocalDateTime toDate) {
        Condition condition = DSL.trueCondition();

        if (method != null) {
            condition = condition.and(PAYMENTS.PAYMENT_METHOD.eq(method.name()));
        }

        if (status != null) {
            condition = condition.and(PAYMENTS.PAYMENT_STATUS.eq(status.name()));
        }

        if (fromDate != null) {
            condition = condition.and(PAYMENTS.CREATED_AT.ge(fromDate));
        }

        if (toDate != null) {
            condition = condition.and(PAYMENTS.CREATED_AT.le(toDate));
        }

        return condition;
    }

    // ==============================
    //       FIND BY ORDER ID
    // ==============================
    public Payment findByOrderId(Integer orderId) {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(PAYMENTS.ORDER_ID.eq(orderId))
                .orderBy(PAYMENTS.CREATED_AT.desc())  // Get latest payment if multiple attempts
                .limit(1)
                .fetchOptionalInto(Payment.class)
                .orElse(null);
    }

    // ==============================
    //   FIND BY TRANSACTION ID
    // ==============================
    public Payment findByTransactionId(String transactionId) {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(PAYMENTS.TRANSACTION_ID.eq(transactionId))
                .fetchOptionalInto(Payment.class)
                .orElse(null);
    }

    // ==============================
    //  FIND BY EXTERNAL REFERENCE
    // ==============================
    public Payment findByExternalReference(String externalReference) {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(PAYMENTS.EXTERNAL_REFERENCE.eq(externalReference))
                .fetchOptionalInto(Payment.class)
                .orElse(null);
    }

    // ==============================
    //          GET BY ID
    // ==============================
    public Payment getById(Integer id) {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(PAYMENTS.ID.eq(id))
                .fetchOptionalInto(Payment.class)
                .orElse(null);
    }

    // ==============================
    //            LIST
    // ==============================
    public List<Payment> getByCriteria(PaymentMethod method, PaymentStatus status,
                                       LocalDateTime fromDate, LocalDateTime toDate,
                                       Pageable pageable) {
        Condition condition = getWhereCondition(method, status, fromDate, toDate);

        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(condition)
                .orderBy(PAYMENTS.CREATED_AT.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getLimit())
                .fetchInto(Payment.class);
    }

    public Long countByCriteria(PaymentMethod method, PaymentStatus status,
                                LocalDateTime fromDate, LocalDateTime toDate) {
        Condition condition = getWhereCondition(method, status, fromDate, toDate);

        return dsl.selectCount()
                .from(PAYMENTS)
                .where(condition)
                .fetchOne(0, Long.class);
    }

    // ==============================
    //          INSERT
    // ==============================
    public Payment insert(Payment p) {
        dsl.insertInto(PAYMENTS)
                .set(PAYMENTS.ORDER_ID, p.getOrderId())
                .set(PAYMENTS.TRANSACTION_ID, p.getTransactionId())
                .set(PAYMENTS.EXTERNAL_REFERENCE, p.getExternalReference())
                .set(PAYMENTS.GATEWAY_RESPONSE, p.getGatewayResponse() != null ? org.jooq.JSON.json(p.getGatewayResponse()) : null)
                .set(PAYMENTS.AMOUNT, p.getAmount())
                .set(PAYMENTS.CURRENCY, p.getCurrency() != null ? p.getCurrency() : "USD")
                .set(PAYMENTS.PAYMENT_METHOD, p.getPaymentMethod() != null ? p.getPaymentMethod().name() : PaymentMethod.STRIPE.name())
                .set(PAYMENTS.PAYMENT_STATUS, p.getPaymentStatus() != null ? p.getPaymentStatus().name() : PaymentStatus.PENDING.name())
                .set(PAYMENTS.PAID_AT, p.getPaidAt())
//                .set(PAYMENTS.CREATED_AT, p.getCreatedAt() != null ? p.getCreatedAt() : LocalDateTime.now())
//                .set(PAYMENTS.UPDATED_AT, p.getUpdatedAt() != null ? p.getUpdatedAt() : LocalDateTime.now())
                .set(PAYMENTS.METADATA, p.getMetadata() != null ? org.jooq.JSON.json(p.getMetadata()) : null)
                .execute();

        p.setId(dsl.lastID().intValue());
        return p;
    }

    // ==============================
    //          UPDATE
    // ==============================
    public Payment update(Payment p) {
        dsl.update(PAYMENTS)
                .set(PAYMENTS.ORDER_ID, p.getOrderId())
                .set(PAYMENTS.TRANSACTION_ID, p.getTransactionId())
                .set(PAYMENTS.EXTERNAL_REFERENCE, p.getExternalReference())
                .set(PAYMENTS.GATEWAY_RESPONSE, p.getGatewayResponse() != null ? org.jooq.JSON.json(p.getGatewayResponse()) : null)
                .set(PAYMENTS.AMOUNT, p.getAmount())
                .set(PAYMENTS.CURRENCY, p.getCurrency())
                .set(PAYMENTS.PAYMENT_METHOD, p.getPaymentMethod() != null ? p.getPaymentMethod().name() : PaymentMethod.STRIPE.name())
                .set(PAYMENTS.PAYMENT_STATUS, p.getPaymentStatus() != null ? p.getPaymentStatus().name() : PaymentStatus.PENDING.name())
                .set(PAYMENTS.PAID_AT, p.getPaidAt())
//                .set(PAYMENTS.UPDATED_AT, LocalDateTime.now())
                .set(PAYMENTS.METADATA, p.getMetadata() != null ? org.jooq.JSON.json(p.getMetadata()) : null)
                .where(PAYMENTS.ID.eq(p.getId()))
                .execute();

        return p;
    }

    // ==============================
    //     UPDATE STATUS ONLY
    // ==============================
    public void updateStatus(Integer id, PaymentStatus status) {
        dsl.update(PAYMENTS)
                .set(PAYMENTS.PAYMENT_STATUS, status.name())
                .set(PAYMENTS.UPDATED_AT, LocalDateTime.now())
                .where(PAYMENTS.ID.eq(id))
                .execute();
    }

    // ==============================
    //    UPDATE STATUS + PAID_AT
    // ==============================
    public void completePayment(Integer id, LocalDateTime paidAt) {
        dsl.update(PAYMENTS)
                .set(PAYMENTS.PAYMENT_STATUS, PaymentStatus.COMPLETED.name())
                .set(PAYMENTS.PAID_AT, paidAt)
                .set(PAYMENTS.UPDATED_AT, LocalDateTime.now())
                .where(PAYMENTS.ID.eq(id))
                .execute();
    }

    // ==============================
    //          DELETE
    // ==============================
    public Integer delete(Integer id) {
        return dsl.deleteFrom(PAYMENTS)
                .where(PAYMENTS.ID.eq(id))
                .execute();
    }

    // ==============================
    //     GET PENDING PAYMENTS
    // ==============================
    public List<Payment> getPendingPayments() {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .where(PAYMENTS.PAYMENT_STATUS.eq(PaymentStatus.PENDING.name()))
                .orderBy(PAYMENTS.CREATED_AT.asc())
                .fetchInto(Payment.class);
    }

    // ==============================
    //   GET PAYMENTS BY USER ID
    // ==============================
    public List<Payment> getByUserId(Integer userId) {
        return dsl.select(getFields())
                .from(PAYMENTS)
                .join(DSL.table("orders")).on(DSL.field("orders.id").eq(PAYMENTS.ORDER_ID))
                .where(DSL.field("orders.user_id").eq(userId))
                .orderBy(PAYMENTS.CREATED_AT.desc())
                .fetchInto(Payment.class);
    }
}