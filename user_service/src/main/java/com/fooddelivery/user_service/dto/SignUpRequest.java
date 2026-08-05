package com.fooddelivery.user_service.dto;

import com.fooddelivery.user_service.entity.RoleName;

public class SignUpRequest {
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
    private String address;
    private RoleName role;

    public SignUpRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public RoleName getRole() { return role; }
    public void setRole(RoleName role) { this.role = role; }
}
