package com.fooddelivery.paymentservice.controller;

import com.fooddelivery.paymentservice.exception.PaymentException;
import com.fooddelivery.paymentservice.entity.Payment;
import com.fooddelivery.paymentservice.service.PaymentService;
import com.razorpay.RazorpayException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/createOrder")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            Long orderId = Long.parseLong(data.get("orderId").toString());
            Double amount = Double.parseDouble(data.get("amount").toString());
            String currency = data.getOrDefault("currency", "INR").toString();
            String userEmail = data.get("userEmail").toString();

            Payment payment = paymentService.createOrder(orderId, amount, currency, userEmail);
            return ResponseEntity.ok(payment);
        } catch (RazorpayException e) {
            throw new PaymentException("Error creating Razorpay Order: " + e.getMessage(), 500);
        } catch (Exception e) {
            throw new PaymentException("Invalid request data: " + e.getMessage(), 400);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String razorpayOrderId = data.get("razorpay_order_id");
        String razorpayPaymentId = data.get("razorpay_payment_id");
        String razorpaySignature = data.get("razorpay_signature");

        boolean isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Payment Verified"));
        } else {
            throw new PaymentException("Payment Verification Failed", 400);
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> razorpayWebhook(@RequestBody Map<String, Object> payload) {
        // Here you would normally parse the webhook event and signature
        // For simplicity, we are triggering the sync method for any payload containing an order_id
        if (payload.containsKey("payload")) {
            Map<String, Object> payloadObject = (Map<String, Object>) payload.get("payload");
            if (payloadObject.containsKey("payment")) {
                Map<String, Object> paymentEntity = (Map<String, Object>) ((Map<String, Object>) payloadObject.get("payment")).get("entity");
                String orderIdStr = (String) paymentEntity.get("order_id");
                
                // Assuming you can map Razorpay order id to local order id
                // Alternatively, you can use syncPaymentStatus(Long localOrderId)
            }
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/sync-status/{orderId}")
    public ResponseEntity<?> syncStatus(@PathVariable Long orderId) {
        Payment payment = paymentService.syncPaymentStatus(orderId);
        if (payment != null) {
            return ResponseEntity.ok(payment);
        }
        return ResponseEntity.notFound().build();
    }
}
