package com.fooddelivery.user_service.dto;

public class ForgotPasswordRequest {
    private String identifier; // email or phone

    public ForgotPasswordRequest() {}

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
}
