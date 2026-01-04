package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.request.vietqr.VietQRCallbackRequest;
import vn.backend.core.data.request.vietqr.VietQRCreatePaymentRequest;
import vn.backend.core.service.VietQRService;
import vn.backend.core.util.Mapper;

@RestController
@RequestMapping("/vietqr")
public class VietQRController {

    @Autowired
    private VietQRService vietQRService;

    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody VietQRCreatePaymentRequest request) {
        var result = vietQRService.createPaymentFromOrder(request);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/callback")
    public ResponseEntity<String> handleCallback(@RequestBody VietQRCallbackRequest callback) {
        String response = vietQRService.handleCallback(callback);
        return ResponseEntity.ok(response);
    }
}
