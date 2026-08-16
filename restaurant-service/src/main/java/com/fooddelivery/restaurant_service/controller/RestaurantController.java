package com.fooddelivery.restaurant_service.controller;

import com.fooddelivery.restaurant_service.entity.Restaurant;
import com.fooddelivery.restaurant_service.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/restaurants")
@RequiredArgsConstructor
public class RestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllActiveRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllActiveRestaurants());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Restaurant>> getPendingRestaurants() {
        return ResponseEntity.ok(restaurantService.getPendingRestaurants());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Restaurant> approveRestaurant(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "MONTHLY") String subscriptionType,
            @RequestParam(required = false, defaultValue = "0.0") Double subscriptionFee) {
        return ResponseEntity.ok(restaurantService.approveRestaurant(id, subscriptionType, subscriptionFee));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Restaurant>> searchRestaurants(@RequestParam String q) {
        return ResponseEntity.ok(restaurantService.searchRestaurants(q));
    }

    @GetMapping("/search/universal")
    public ResponseEntity<com.fooddelivery.restaurant_service.dto.SearchResultDTO> universalSearch(@RequestParam String q) {
        return ResponseEntity.ok(restaurantService.universalSearch(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantById(id));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(restaurantService.getRestaurantsByOwner(ownerId));
    }

    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        // In real app, we should get ownerId from JWT Token instead of Request Body
        return new ResponseEntity<>(restaurantService.createRestaurant(restaurant), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.ok().build();
    }
}

