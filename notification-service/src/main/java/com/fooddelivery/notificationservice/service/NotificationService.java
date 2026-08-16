package com.fooddelivery.notificationservice.service;

import com.fooddelivery.notificationservice.entity.Notification;
import com.fooddelivery.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification sendNotification(Long recipientId, String recipientType, String message) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setRecipientType(recipientType);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Long recipientId, String recipientType, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByRecipientIdAndRecipientTypeAndStatusOrderByCreatedAtDesc(recipientId, recipientType, "UNREAD");
        }
        return notificationRepository.findByRecipientIdAndRecipientTypeOrderByCreatedAtDesc(recipientId, recipientType);
    }

    public boolean markAsRead(Long notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setStatus("READ");
            notificationRepository.save(notification);
            return true;
        }
        return false;
    }
}
