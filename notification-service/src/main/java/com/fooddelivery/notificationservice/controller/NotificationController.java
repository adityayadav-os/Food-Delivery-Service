package com.fooddelivery.notificationservice.controller;

import com.fooddelivery.notificationservice.entity.Notification;
import com.fooddelivery.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Map<String, Object> payload) {
        Long recipientId = Long.parseLong(payload.get("recipientId").toString());
        String recipientType = payload.get("recipientType").toString();
        String message = payload.get("message").toString();

        Notification notification = notificationService.sendNotification(recipientId, recipientType, message);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/{recipientType}/{recipientId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable String recipientType,
            @PathVariable Long recipientId,
            @RequestParam(required = false, defaultValue = "false") boolean unreadOnly) {
        
        List<Notification> notifications = notificationService.getNotifications(recipientId, recipientType.toUpperCase(), unreadOnly);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Notification marked as read"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/update-eta")
    public ResponseEntity<?> updateEta(@RequestBody Map<String, Object> payload) {
        Long customerId = Long.parseLong(payload.get("customerId").toString());
        String eta = payload.get("eta").toString();
        
        // This is a special endpoint that a restaurant calls to send an ETA back to the customer
        String message = "Your order will be delivered in approximately " + eta;
        Notification notification = notificationService.sendNotification(customerId, "CUSTOMER", message);
        
        return ResponseEntity.ok(notification);
    }
}
