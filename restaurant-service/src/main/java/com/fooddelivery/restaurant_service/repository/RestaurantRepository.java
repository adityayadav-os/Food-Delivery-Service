package com.fooddelivery.restaurant_service.repository;

import com.fooddelivery.restaurant_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByIsActiveTrue();
    List<Restaurant> findByOwnerId(Long ownerId);
}
