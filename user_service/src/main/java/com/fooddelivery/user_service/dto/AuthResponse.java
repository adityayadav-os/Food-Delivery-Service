package com.fooddelivery.user_service.dto;

import com.fooddelivery.user_service.entity.User;

public class AuthResponse {
    private String token;
    private String message;
    private User user;

    public AuthResponse() {}

    public AuthResponse(String token, String message, User user) {
        this.token = token;
        this.message = message;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
