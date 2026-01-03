package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.extention.paging.Page;
import vn.backend.core.config.extention.paging.Pageable;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.service.PaymentService;
import vn.backend.core.util.Mapper;
import vn.backend.entity.data.constant.PaymentMethod;
import vn.backend.entity.data.constant.PaymentStatus;
import vn.backend.entity.data.mysql.Payment;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Autowired
    private PaymentService service;

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Page<Payment>>> list(
            @RequestParam(required = false) PaymentMethod method,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            Pageable pageable
    ) {
        var result = service.getList(method, status, fromDate, toDate, pageable);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<Payment>> get(
            @RequestParam Integer id
    ) {
        var result = service.getById(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Payment>> create(
            @RequestBody Payment req
    ) {
        var result = service.create(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/update")
    public ResponseEntity<ApiResponse<Payment>> update(
            @RequestBody Payment req
    ) {
        var result = service.update(req);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/delete")
    public ResponseEntity<ApiResponse<Integer>> delete(
            @RequestParam Integer id
    ) {
        var result = service.delete(id);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/by-order")
    public ResponseEntity<ApiResponse<Payment>> getByOrderId(
            @RequestParam Integer orderId
    ) {
        var result = service.getByOrderId(orderId);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/by-transaction")
    public ResponseEntity<ApiResponse<Payment>> getByTransactionId(
            @RequestParam String transactionId
    ) {
        var result = service.getByTransactionId(transactionId);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @GetMapping("/by-external-reference")
    public ResponseEntity<ApiResponse<Payment>> getByExternalReference(
            @RequestParam String externalReference
    ) {
        var result = service.getByExternalReference(externalReference);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/update-status")
    public ResponseEntity<ApiResponse<Payment>> updateStatus(
            @RequestParam Integer paymentId,
            @RequestParam PaymentStatus status
    ) {
        var result = service.updatePaymentStatus(paymentId, status);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}