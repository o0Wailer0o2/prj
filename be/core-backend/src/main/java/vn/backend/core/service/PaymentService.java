package vn.backend.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.repository.PaymentRepository;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.Payment;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository repo;

    // ==============================
    //           CRUD
    // ==============================
    public Page<Payment> getList(
            PaymentMethod method,
            PaymentStatus status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            Pageable pageable
    ) {
        var items = repo.getByCriteria(method, status, fromDate, toDate, pageable);
        var total = repo.countByCriteria(method, status, fromDate, toDate);
        pageable.setTotal(total);
        return new Page<>(pageable, items);
    }

    public Payment getById(Integer id) {
        return repo.getById(id);
    }

    @Transactional
    public Payment create(Payment req) {
        // Set default values if not provided
        if (req.getPaymentStatus() == null) {
            req.setPaymentStatus(PaymentStatus.PENDING);
        }
        if (req.getCurrency() == null || req.getCurrency().isEmpty()) {
            req.setCurrency("USD");
        }
        if (req.getPaymentMethod() == null) {
            req.setPaymentMethod(PaymentMethod.CASH);
        }
        return repo.insert(req);
    }

    @Transactional
    public Payment update(Payment req) {
        // Ensure updated_at is set to now
        req.setUpdatedAt(LocalDateTime.now());
        return repo.update(req);
    }

    @Transactional
    public Integer delete(Integer id) {
        return repo.delete(id);
    }

    public Payment getByOrderId(Integer orderId) {
        return repo.findByOrderId(orderId);
    }

    public Payment getByTransactionId(String transactionId) {
        return repo.findByTransactionId(transactionId);
    }

    public Payment getByExternalReference(String externalReference) {
        return repo.findByExternalReference(externalReference);
    }

    @Transactional
    public Payment createPaymentForOrder(Integer orderId, Double amount, PaymentMethod method, Map<String, Object> metadata) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .paymentMethod(method)
                .paymentStatus(PaymentStatus.PENDING)
                .currency("USD")
                .build();

        if (metadata != null) {
            payment.setMetadataMap(metadata);
        }

        return repo.insert(payment);
    }

    @Transactional
    public Payment initializePayment(Integer orderId, String transactionId, Double amount,
                                     PaymentMethod method, Object gatewayResponse) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .transactionId(transactionId)
                .amount(amount)
                .paymentMethod(method)
                .paymentStatus(PaymentStatus.PENDING)
                .currency("USD")
                .build();

        if (gatewayResponse != null) {
            payment.setGatewayResponseObject(gatewayResponse);
        }

        return repo.insert(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(Integer paymentId, PaymentStatus status) {
        repo.updateStatus(paymentId, status);
        return repo.getById(paymentId);
    }

    @Transactional
    public Payment markAsCompleted(Integer paymentId, LocalDateTime paidAt) {
        repo.completePayment(paymentId, paidAt);
        return repo.getById(paymentId);
    }

    @Transactional
    public Payment processSuccessfulPayment(String transactionId, String externalReference,
                                            Object gatewayResponse) {
        Payment payment = repo.findByTransactionId(transactionId);
        if (payment == null) {
            throw new RuntimeException("Payment not found for transaction: " + transactionId);
        }

        payment.setExternalReference(externalReference);
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());

        if (gatewayResponse != null) {
            payment.setGatewayResponseObject(gatewayResponse);
        }

        return repo.update(payment);
    }

    @Transactional
    public Payment processFailedPayment(String transactionId, Object gatewayResponse) {
        Payment payment = repo.findByTransactionId(transactionId);
        if (payment == null) {
            throw new RuntimeException("Payment not found for transaction: " + transactionId);
        }

        payment.setPaymentStatus(PaymentStatus.FAILED);
        if (gatewayResponse != null) {
            payment.setGatewayResponseObject(gatewayResponse);
        }

        return repo.update(payment);
    }

    public List<Payment> getPendingPayments() {
        return repo.getPendingPayments();
    }

    public List<Payment> getRecentSuccessfulPayments(int limit) {
        Pageable pageable = new Pageable();
        pageable.setPage(1);
        pageable.setLimit(limit);

        return repo.getByCriteria(null, PaymentStatus.COMPLETED,
                LocalDateTime.now().minusDays(30), LocalDateTime.now(), pageable);
    }

    public List<Payment> getPaymentsByUserId(Integer userId) {
        return repo.getByUserId(userId);
    }

    // ==============================
    //        VALIDATION
    // ==============================
    public boolean validatePaymentAmount(Integer paymentId, Double expectedAmount) {
        Payment payment = repo.getById(paymentId);
        if (payment == null) {
            return false;
        }
        return payment.getAmount().equals(expectedAmount);
    }

    public Double getTotalPaidAmountByOrder(Integer orderId) {
        Payment payment = repo.findByOrderId(orderId);
        // Nếu muốn tính tổng tất cả các lần thanh toán (nếu có nhiều lần) thì cần sửa repository.
        // Hiện tại findByOrderId chỉ trả về payment mới nhất.
        // Giả sử mỗi order chỉ có một payment, hoặc chúng ta chỉ quan tâm payment thành công mới nhất.
        if (payment != null && payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return payment.getAmount();
        }
        return 0.0;
    }
}