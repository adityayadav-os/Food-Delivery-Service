package com.fooddelivery.restaurant_service.service;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import com.fooddelivery.restaurant_service.entity.Restaurant;
import com.fooddelivery.restaurant_service.exception.ResourceNotFoundException;
import com.fooddelivery.restaurant_service.repository.MenuItemRepository;
import com.fooddelivery.restaurant_service.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public Restaurant createRestaurant(Restaurant restaurant) {
        System.out.println("Creating restaurant with new code! isActive: " + restaurant.getIsActive());
        if (restaurant.getIsActive() == null) restaurant.setIsActive(true);
        if (restaurant.getIsApproved() == null) restaurant.setIsApproved(false);
        System.out.println("After setting defaults: isActive: " + restaurant.getIsActive());
        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with ID: " + id));
    }

    @Override
    @Cacheable(value = "restaurants")
    public List<Restaurant> getAllActiveRestaurants() {
        return restaurantRepository.findByIsActiveTrueAndIsApprovedTrue();
    }

    @Override
    public List<Restaurant> getPendingRestaurants() {
        return restaurantRepository.findByIsApprovedFalse();
    }

    @Override
    public Restaurant approveRestaurant(Long id, String subscriptionType, Double subscriptionFee) {
        Restaurant restaurant = getRestaurantById(id);
        restaurant.setIsApproved(true);
        restaurant.setSubscriptionType(subscriptionType);
        restaurant.setSubscriptionFee(subscriptionFee);
        return restaurantRepository.save(restaurant);
    }

    @Override
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = getRestaurantById(id);
        restaurant.setIsApproved(false);
        restaurantRepository.save(restaurant);
    }

    @Override
    public List<Restaurant> searchRestaurants(String query) {
        return restaurantRepository.searchApprovedRestaurants(query);
    }

    @Override
    @Cacheable(value = "search", key = "#query")
    public com.fooddelivery.restaurant_service.dto.SearchResultDTO universalSearch(String query) {
        List<Restaurant> restaurants = restaurantRepository.searchApprovedRestaurants(query);
        List<MenuItem> dishes = menuItemRepository.searchMenuItems(query);
        return new com.fooddelivery.restaurant_service.dto.SearchResultDTO(restaurants, dishes);
    }

    @Override
    public List<Restaurant> getRestaurantsByOwner(Long ownerId) {
        return restaurantRepository.findByOwnerId(ownerId);
    }

    @Override
    public MenuItem addMenuItem(Long restaurantId, MenuItem menuItem) {
        if (menuItem.getIsAvailable() == null) menuItem.setIsAvailable(true);
        Restaurant restaurant = getRestaurantById(restaurantId);
        menuItem.setRestaurant(restaurant);
        return menuItemRepository.save(menuItem);
    }

    @Override
    public MenuItem updateMenuItem(Long itemId, MenuItem itemDetails) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found"));
        menuItem.setName(itemDetails.getName());
        menuItem.setDescription(itemDetails.getDescription());
        menuItem.setPrice(itemDetails.getPrice());
        menuItem.setCategory(itemDetails.getCategory());
        menuItem.setIsAvailable(itemDetails.getIsAvailable());
        return menuItemRepository.save(menuItem);
    }

    @Override
    public void deleteMenuItem(Long itemId) {
        MenuItem menuItem = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu Item not found"));
        menuItemRepository.delete(menuItem);
    }

    @Override
    @Cacheable(value = "menu", key = "#restaurantId")
    public List<MenuItem> getMenuForRestaurant(Long restaurantId, boolean onlyAvailable) {
        if (onlyAvailable) {
            return menuItemRepository.findByRestaurantIdAndIsAvailableTrue(restaurantId);
        }
        return menuItemRepository.findByRestaurantId(restaurantId);
    }
}
