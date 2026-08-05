package com.fooddelivery.restaurant_service.service;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import com.fooddelivery.restaurant_service.entity.Restaurant;
import com.fooddelivery.restaurant_service.repository.MenuItemRepository;
import com.fooddelivery.restaurant_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        Restaurant restaurant = getRestaurantById(id);
        restaurant.setName(restaurantDetails.getName());
        restaurant.setLocation(restaurantDetails.getLocation());
        restaurant.setContactNumber(restaurantDetails.getContactNumber());
        restaurant.setActive(restaurantDetails.isActive());
        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found with ID: " + id));
    }

    @Override
    public List<Restaurant> getAllActiveRestaurants() {
        return restaurantRepository.findByIsActiveTrue();
    }

    @Override
    public List<Restaurant> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }

    @Override
    public MenuItem addMenuItem(Long restaurantId, MenuItem menuItem) {
        Restaurant restaurant = getRestaurantById(restaurantId);
        menuItem.setRestaurant(restaurant);
        return menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItem updateMenuItem(Long itemId, MenuItem itemDetails) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));
        menuItem.setName(itemDetails.getName());
        menuItem.setDescription(itemDetails.getDescription());
        menuItem.setPrice(itemDetails.getPrice());
        menuItem.setAvailable(itemDetails.isAvailable());
        menuItem.setCategory(itemDetails.getCategory());
        return menuItemRepository.save(menuItem);
    }

    @Override
    public void deleteMenuItem(Long itemId) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));
        menuItemRepository.delete(menuItem);
    }

    @Override
    public List<MenuItem> getMenuForRestaurant(Long restaurantId, boolean onlyAvailable) {
        if (onlyAvailable) {
            return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
        }
        return menuItemRepository.findByRestaurantId(restaurantId);
    }
}
