package com.fooddelivery.restaurant_service.service;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import com.fooddelivery.restaurant_service.entity.Restaurant;

import java.util.List;

public interface RestaurantService {
    Restaurant createRestaurant(Restaurant restaurant);
    Restaurant getRestaurantById(Long id);
    List<Restaurant> getAllActiveRestaurants();
    List<Restaurant> getRestaurantsByOwner(Long ownerId);
    List<Restaurant> getPendingRestaurants();
    Restaurant approveRestaurant(Long id, String subscriptionType, Double subscriptionFee);
    void deleteRestaurant(Long id);
    List<Restaurant> searchRestaurants(String query);
    com.fooddelivery.restaurant_service.dto.SearchResultDTO universalSearch(String query);

    MenuItem addMenuItem(Long restaurantId, MenuItem menuItem);
    MenuItem updateMenuItem(Long itemId, MenuItem itemDetails);
    void deleteMenuItem(Long itemId);
    List<MenuItem> getMenuForRestaurant(Long restaurantId, boolean onlyAvailable);
}
