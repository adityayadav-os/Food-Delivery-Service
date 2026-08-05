package com.fooddelivery.user_service.service;

import com.fooddelivery.user_service.dto.AuthResponse;
import com.fooddelivery.user_service.dto.SignInRequest;
import com.fooddelivery.user_service.dto.SignUpRequest;

public interface UserService {
    AuthResponse registerUser(SignUpRequest signUpRequest);
    AuthResponse authenticateUser(SignInRequest signInRequest);
    void forgotPassword(com.fooddelivery.user_service.dto.ForgotPasswordRequest request);
    void resetPassword(com.fooddelivery.user_service.dto.ResetPasswordRequest request);
}
