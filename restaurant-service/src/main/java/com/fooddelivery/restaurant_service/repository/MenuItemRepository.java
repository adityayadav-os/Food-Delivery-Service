package com.fooddelivery.restaurant_service.repository;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByRestaurantId(Long restaurantId);
    List<MenuItem> findByRestaurantIdAndIsAvailableTrue(Long restaurantId);

    @org.springframework.data.jpa.repository.Query("SELECT m FROM MenuItem m JOIN FETCH m.restaurant r WHERE m.isAvailable = true AND r.isApproved = true AND r.isActive = true AND LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MenuItem> searchMenuItems(@org.springframework.data.repository.query.Param("query") String query);
}
