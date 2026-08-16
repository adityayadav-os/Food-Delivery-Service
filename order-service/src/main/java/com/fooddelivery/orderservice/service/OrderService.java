package com.fooddelivery.orderservice.service;

import com.fooddelivery.orderservice.entity.Order;
import com.fooddelivery.orderservice.entity.OrderItem;
import com.fooddelivery.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import com.fooddelivery.orderservice.dto.PaymentCompletedEvent;
import com.fooddelivery.orderservice.dto.OrderFailedEvent;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order createOrder(Long userId, Long restaurantId, List<OrderItem> items, String customerName, String deliveryAddress, String customerPhone) {
        Order order = new Order();
        order.setUserId(userId);
        order.setRestaurantId(restaurantId);
        order.setStatus("PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setCustomerName(customerName);
        order.setDeliveryAddress(deliveryAddress);
        order.setCustomerPhone(customerPhone);

        double totalAmount = 0.0;
        for (OrderItem item : items) {
            order.addItem(item);
            totalAmount += item.getPrice() * item.getQuantity();
        }
        order.setTotalAmount(totalAmount);

        return orderRepository.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId);
    }

    public Order updateOrderStatus(Long orderId, String newStatus, Integer estimatedPrepTime) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.fooddelivery.orderservice.exception.ResourceNotFoundException("Order not found with id: " + orderId));
        order.setStatus(newStatus);
        if (estimatedPrepTime != null) {
            order.setEstimatedPrepTime(estimatedPrepTime);
        }
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public List<Order> getOrdersByDeliveryPartnerId(Long deliveryPartnerId) {
        return orderRepository.findByDeliveryPartnerId(deliveryPartnerId);
    }

    public Order assignDeliveryPartner(Long orderId, Long partnerId, String partnerName, String partnerPhone) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new com.fooddelivery.orderservice.exception.ResourceNotFoundException("Order not found with id: " + orderId));
        order.setDeliveryPartnerId(partnerId);
        order.setDeliveryPartnerName(partnerName);
        order.setDeliveryPartnerPhone(partnerPhone);
        return orderRepository.save(order);
    }
}
