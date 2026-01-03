package vn.backend.core.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.backend.core.config.model.ApiResponse;
import vn.backend.core.data.request.StripeCreatePaymentRequest;
import vn.backend.core.service.StripeService;
import vn.backend.core.util.Mapper;

@RestController
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/stripe/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody StripeCreatePaymentRequest stripeCreatePaymentRequest) {
        var result = stripeService.createPaymentFromOrder(stripeCreatePaymentRequest);
        return Mapper.map(result, ApiResponse::okEntity);
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleWebhook(@RequestHeader("Stripe-Signature") String sigHeader,
                                                @RequestBody String payload) {
        System.out.println("-----------------------------------");
        String response = stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok(response);
    }

//    @GetMapping("/success")
//    public ResponseEntity<?> verifyPayment(@RequestParam String session_id) {
//        return ResponseEntity.ok(
//                new ApiResponse<>(200,
//                        "Payment verified successfully",
//                        stripeService.verifyPayment(session_id)));
//    }
}