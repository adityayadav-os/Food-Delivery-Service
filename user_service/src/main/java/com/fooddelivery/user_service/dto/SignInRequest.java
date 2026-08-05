package com.fooddelivery.user_service.dto;

public class SignInRequest {
    private String identifier; // This can be email or phoneNumber
    private String password;

    public SignInRequest() {}

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
