package com.fooddelivery.paymentservice.service;

import com.fooddelivery.paymentservice.entity.Payment;
import com.fooddelivery.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Optional;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import com.fooddelivery.paymentservice.config.RabbitMQConfig;
import com.fooddelivery.paymentservice.dto.PaymentCompletedEvent;
import com.fooddelivery.paymentservice.dto.OrderFailedEvent;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Payment createOrder(Long orderId, Double amount, String currency, String userEmail) throws RazorpayException {
        // Idempotency Check: Agar is orderId ke liye pehle se payment exist karta hai, 
        // toh wahi return kar do naya create karne ki bajaye.
        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrderId(orderId);
        if (existingPaymentOpt.isPresent()) {
            return existingPaymentOpt.get();
        }

        RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        JSONObject orderRequest = new JSONObject();
        // Razorpay accepts amount in paise (multiply by 100)
        orderRequest.put("amount", amount * 100);
        orderRequest.put("currency", currency);
        orderRequest.put("receipt", "receipt_order_" + orderId);
        
        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setUserEmail(userEmail);
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment.setStatus("PENDING");

        return paymentRepository.save(payment);
    }

    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValidSignature = Utils.verifyPaymentSignature(options, razorpayKeySecret);
            
            if (isValidSignature) {
                Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    payment.setRazorpayPaymentId(razorpayPaymentId);
                    payment.setRazorpaySignature(razorpaySignature);
                    payment.setStatus("SUCCESS");
                    paymentRepository.save(payment);
                    
                    // Update Order Status via SAGA (RabbitMQ Event)
                    try {
                        PaymentCompletedEvent event = new PaymentCompletedEvent(payment.getOrderId(), payment.getRazorpayPaymentId(), "PAID");
                        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, "payment.completed", event);
                        System.out.println("Published PaymentCompletedEvent for Order ID: " + payment.getOrderId());
                    } catch (Exception e) {
                        System.err.println("Failed to publish RabbitMQ event (Is RabbitMQ running?): " + e.getMessage());
                        System.out.println("Using REST API fallback to update order status...");
                        try {
                            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                            String updateOrderUrl = "http://localhost:8083/api/orders/" + payment.getOrderId() + "/status?status=PAID";
                            restTemplate.put(updateOrderUrl, null);
                        } catch (Exception ex) {
                            System.err.println("REST API fallback also failed: " + ex.getMessage());
                        }
                    }

                    // Send Email Notification
                    sendPaymentSuccessEmail(payment.getUserEmail(), payment.getOrderId(), payment.getAmount());
                }
                return true;
            } else {
                handlePaymentFailure(razorpayOrderId);
                return false;
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void handlePaymentFailure(String razorpayOrderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus("FAILED");
            paymentRepository.save(payment);
            
            // Optionally send failure email
            sendPaymentFailureEmail(payment.getUserEmail(), payment.getOrderId());
        }
    }

    public Payment syncPaymentStatus(Long orderId) {
        Optional<Payment> paymentOpt = paymentRepository.findByOrderId(orderId);
        if (paymentOpt.isPresent() && paymentOpt.get().getStatus().equals("PENDING")) {
            Payment payment = paymentOpt.get();
            try {
                RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                Order order = razorpayClient.orders.fetch(payment.getRazorpayOrderId());
                String status = order.get("status"); // created, attempted, paid
                
                if ("paid".equalsIgnoreCase(status)) {
                    payment.setStatus("SUCCESS");
                    paymentRepository.save(payment);
                    
                    // Update Order Status in order-service to PAID
                    try {
                        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                        String updateOrderUrl = "http://localhost:8083/api/orders/" + payment.getOrderId() + "/status?status=PAID";
                        restTemplate.put(updateOrderUrl, null);
                    } catch (Exception e) {
                        System.err.println("Failed to update order status: " + e.getMessage());
                    }

                    sendPaymentSuccessEmail(payment.getUserEmail(), payment.getOrderId(), payment.getAmount());
                }
            } catch (RazorpayException e) {
                e.printStackTrace();
            }
            return payment;
        }
        return null;
    }

    private void sendPaymentSuccessEmail(String toEmail, Long orderId, Double amount) {
        try {
            if (toEmail == null || toEmail.isEmpty()) return;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Payment Successful for Order #" + orderId);
            message.setText("Dear Customer,\n\nYour payment of " + amount + " has been successfully received.\nYour order #" + orderId + " is confirmed and being processed.\n\nThank you for choosing Food Delivery Service!");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending success email: " + e.getMessage());
        }
    }

    private void sendPaymentFailureEmail(String toEmail, Long orderId) {
        try {
            if (toEmail == null || toEmail.isEmpty()) return;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Payment Failed for Order #" + orderId);
            message.setText("Dear Customer,\n\nWe noticed a failed payment attempt for your order #" + orderId + ".\nPlease try again or use a different payment method.\n\nThank you!");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending failure email: " + e.getMessage());
        }
    }
}
