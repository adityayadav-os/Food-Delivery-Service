package com.fooddelivery.notificationservice.repository;

import com.fooddelivery.notificationservice.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndRecipientTypeOrderByCreatedAtDesc(Long recipientId, String recipientType);
    List<Notification> findByRecipientIdAndRecipientTypeAndStatusOrderByCreatedAtDesc(Long recipientId, String recipientType, String status);
}
