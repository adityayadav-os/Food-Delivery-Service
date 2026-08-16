package com.fooddelivery.paymentservice.exception;

public class PaymentException extends RuntimeException {
    
    private final int status;

    public PaymentException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
