package com.fooddelivery.orderservice.controller;

import com.fooddelivery.orderservice.dto.OrderRequest;
import com.fooddelivery.orderservice.entity.Order;
import com.fooddelivery.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest orderRequest) {
        Order order = orderService.createOrder(
                orderRequest.getUserId(),
                orderRequest.getRestaurantId(),
                orderRequest.getItems(),
                orderRequest.getCustomerName(),
                orderRequest.getDeliveryAddress(),
                orderRequest.getCustomerPhone()
        );
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        return new ResponseEntity<>(orderService.getOrdersByUserId(userId), HttpStatus.OK);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Order>> getOrdersByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(orderService.getOrdersByRestaurantId(restaurantId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status, @RequestParam(required = false) Integer estimatedPrepTime) {
        Order updatedOrder = orderService.updateOrderStatus(id, status, estimatedPrepTime);

        // Automatically send notification to Customer if order is DELIVERED
        if ("DELIVERED".equalsIgnoreCase(status)) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String notificationUrl = "http://localhost:8085/api/notifications/send";
                java.util.Map<String, Object> notificationPayload = java.util.Map.of(
                    "recipientId", updatedOrder.getUserId(),
                    "recipientType", "CUSTOMER",
                    "message", "Yay! Your order #" + id + " has been successfully DELIVERED. Enjoy your food!"
                );
                restTemplate.postForEntity(notificationUrl, notificationPayload, String.class);
            } catch (Exception e) {
                System.out.println("Could not send delivery notification: " + e.getMessage());
            }
        } else if ("OUT_FOR_DELIVERY".equalsIgnoreCase(status)) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                String notificationUrl = "http://localhost:8085/api/notifications/send";
                java.util.Map<String, Object> notificationPayload = java.util.Map.of(
                    "recipientId", updatedOrder.getUserId(),
                    "recipientType", "CUSTOMER",
                    "message", "Your food is on the way! The delivery partner has picked up your order."
                );
                restTemplate.postForEntity(notificationUrl, notificationPayload, String.class);
            } catch (Exception e) {
                System.out.println("Could not send out-for-delivery notification: " + e.getMessage());
            }
        }

        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @GetMapping("/delivery/{partnerId}")
    public ResponseEntity<List<Order>> getOrdersByDeliveryPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(orderService.getOrdersByDeliveryPartnerId(partnerId));
    }

    @PutMapping("/{id}/assign-delivery")
    public ResponseEntity<Order> assignDeliveryPartner(
            @PathVariable Long id,
            @RequestParam Long partnerId,
            @RequestParam String partnerName,
            @RequestParam String partnerPhone) {
        Order updatedOrder = orderService.assignDeliveryPartner(id, partnerId, partnerName, partnerPhone);
        
        // Notify Customer
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String notificationUrl = "http://localhost:8085/api/notifications/send";
            java.util.Map<String, Object> notificationPayload = java.util.Map.of(
                "recipientId", updatedOrder.getUserId(),
                "recipientType", "CUSTOMER",
                "message", "Your delivery partner " + partnerName + " (" + partnerPhone + ") has been assigned and is heading to the restaurant!"
            );
            restTemplate.postForEntity(notificationUrl, notificationPayload, String.class);
        } catch (Exception e) {
            System.out.println("Could not send assignment notification: " + e.getMessage());
        }

        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }
}

