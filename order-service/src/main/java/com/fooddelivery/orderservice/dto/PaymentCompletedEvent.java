package com.fooddelivery.orderservice.dto;

import java.io.Serializable;

public class PaymentCompletedEvent implements Serializable {
    private Long orderId;
    private String paymentId;
    private String status;

    public PaymentCompletedEvent() {
    }

    public PaymentCompletedEvent(Long orderId, String paymentId, String status) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.status = status;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
