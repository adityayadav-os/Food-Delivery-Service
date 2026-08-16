package com.fooddelivery.orderservice.dto;

import java.io.Serializable;

public class OrderFailedEvent implements Serializable {
    private Long orderId;
    private String reason;

    public OrderFailedEvent() {
    }

    public OrderFailedEvent(Long orderId, String reason) {
        this.orderId = orderId;
        this.reason = reason;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
