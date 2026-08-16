package com.fooddelivery.restaurant_service.controller;

import com.fooddelivery.restaurant_service.entity.MenuItem;
import com.fooddelivery.restaurant_service.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuController {

    private final RestaurantService restaurantService;

    @GetMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<List<MenuItem>> getMenuForRestaurant(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "true") boolean onlyAvailable) {
        return ResponseEntity.ok(restaurantService.getMenuForRestaurant(restaurantId, onlyAvailable));
    }

    @PostMapping("/restaurants/{restaurantId}/menu")
    public ResponseEntity<MenuItem> addMenuItem(
            @PathVariable Long restaurantId,
            @RequestBody MenuItem menuItem) {
        return new ResponseEntity<>(restaurantService.addMenuItem(restaurantId, menuItem), HttpStatus.CREATED);
    }

    @PutMapping("/menu/{itemId}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Long itemId,
            @RequestBody MenuItem menuItem) {
        return ResponseEntity.ok(restaurantService.updateMenuItem(itemId, menuItem));
    }

    @DeleteMapping("/menu/{itemId}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long itemId) {
        restaurantService.deleteMenuItem(itemId);
        return ResponseEntity.noContent().build();
    }
}

