package com.fooddelivery.restaurant_service.repository;

import com.fooddelivery.restaurant_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrueAndIsApprovedTrue();
    List<Restaurant> findByIsApprovedFalse();
    List<Restaurant> findByOwnerId(Long ownerId);
    
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Restaurant r WHERE r.isApproved = true AND r.isActive = true AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Restaurant> searchApprovedRestaurants(@org.springframework.data.repository.query.Param("query") String query);
}
