package com.fooddelivery.restaurant_service.service;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import com.fooddelivery.restaurant_service.entity.Restaurant;

import java.util.List;

public interface RestaurantService {
    Restaurant createRestaurant(Restaurant restaurant);
    Restaurant updateRestaurant(Long id, Restaurant restaurantDetails);
    Restaurant getRestaurantById(Long id);
    List<Restaurant> getAllActiveRestaurants();
    List<Restaurant> getRestaurantsByOwner(Long ownerId);

    MenuItem addMenuItem(Long restaurantId, MenuItem menuItem);
    MenuItem updateMenuItem(Long itemId, MenuItem itemDetails);
    void deleteMenuItem(Long itemId);
    List<MenuItem> getMenuForRestaurant(Long restaurantId, boolean onlyAvailable);
}
