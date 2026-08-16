package com.fooddelivery.notificationservice.exception;

public class NotificationException extends RuntimeException {
    private final int status;

    public NotificationException(String message, int status) {
        super(message);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
