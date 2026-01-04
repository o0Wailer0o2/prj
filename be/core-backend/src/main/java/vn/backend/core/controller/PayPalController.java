package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.request.paypal.PayPalCaptureRequest;
import vn.backend.core.data.request.paypal.PayPalCreatePaymentRequest;
import vn.backend.core.data.request.paypal.PayPalRefundRequest;
import vn.backend.core.service.PayPalService;
import vn.backend.core.util.Mapper;

@RestController
@RequestMapping("/vnpay")
public class PayPalController {

    @Autowired
    private PayPalService payPalService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody PayPalCreatePaymentRequest request) {
        var result = payPalService.createPaymentFromOrder(request);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/capture")
    public ResponseEntity<?> capturePayment(@RequestBody PayPalCaptureRequest request) {
        var result = payPalService.capturePayment(request);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refundPayment(@RequestBody PayPalRefundRequest request) {
        var result = payPalService.refundPayment(request);
        return Mapper.map(result, ApiResponse::okEntity);
    }
}
