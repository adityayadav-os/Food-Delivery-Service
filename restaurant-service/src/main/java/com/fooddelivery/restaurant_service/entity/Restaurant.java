package com.fooddelivery.restaurant_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "restaurants", indexes = {
    @Index(name = "idx_restaurant_name", columnList = "name"),
    @Index(name = "idx_restaurant_location", columnList = "location")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private Long ownerId; // ID of the RESTAURANT_OWNER from User Service

    private String contactNumber;

    private Boolean isActive = true;

    private Boolean isApproved = false;

    @Column(length = 1000)
    private String imageUrl;

    private String subscriptionType; // MONTHLY, YEARLY, FULL_PAYMENT
    private Double subscriptionFee;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
