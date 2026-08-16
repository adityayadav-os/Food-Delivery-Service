package com.fooddelivery.user_service.service;

import com.fooddelivery.user_service.dto.AuthResponse;
import com.fooddelivery.user_service.dto.SignInRequest;
import com.fooddelivery.user_service.dto.SignUpRequest;
import com.fooddelivery.user_service.entity.User;
import com.fooddelivery.user_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

import com.fooddelivery.user_service.entity.OtpToken;
import com.fooddelivery.user_service.repository.OtpTokenRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpTokenRepository otpTokenRepository;
    private final OtpSenderService otpSenderService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, OtpTokenRepository otpTokenRepository, OtpSenderService otpSenderService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.otpTokenRepository = otpTokenRepository;
        this.otpSenderService = otpSenderService;
    }

    @Override
    public AuthResponse registerUser(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new com.fooddelivery.user_service.exception.UserAlreadyExistsException("Error: Email is already taken!");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new com.fooddelivery.user_service.exception.UserAlreadyExistsException("Error: Phone Number is already taken!");
        }

        if (request.getRole() == com.fooddelivery.user_service.entity.RoleName.ROLE_ADMIN) {
            throw new IllegalArgumentException("Error: Cannot register as Super Admin directly!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        // 4. Return success response (in real app, generate JWT token)
        return new AuthResponse("Dummy-JWT-Token-For-Now", "User registered successfully", savedUser);
    }

    @Override
    public AuthResponse authenticateUser(SignInRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getIdentifier());
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByPhoneNumber(request.getIdentifier());
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                // 3. Return token
                return new AuthResponse("Dummy-JWT-Token-For-Now", "Login successful", user);
            } else {
                throw new com.fooddelivery.user_service.exception.InvalidCredentialsException("Invalid Password");
            }
        } else {
            throw new com.fooddelivery.user_service.exception.UserNotFoundException("User not found with provided email or phone number");
        }
    }

    @Override
    @Transactional
    public void forgotPassword(com.fooddelivery.user_service.dto.ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getIdentifier());
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByPhoneNumber(request.getIdentifier());
        }

        if (userOptional.isEmpty()) {
            throw new com.fooddelivery.user_service.exception.UserNotFoundException("User not found with provided email or phone number");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Delete any existing OTP for this identifier before creating new one
        otpTokenRepository.deleteByIdentifier(request.getIdentifier());

        OtpToken otpToken = new OtpToken(request.getIdentifier(), otp, LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(otpToken);

        // Send OTP via Email or SMS
        otpSenderService.sendOtp(request.getIdentifier(), otp);
    }

    @Override
    @Transactional
    public void resetPassword(com.fooddelivery.user_service.dto.ResetPasswordRequest request) {
        Optional<OtpToken> otpTokenOpt = otpTokenRepository.findByIdentifierAndOtp(request.getIdentifier(), request.getOtp());
        
        if (otpTokenOpt.isEmpty()) {
            throw new com.fooddelivery.user_service.exception.InvalidCredentialsException("Invalid OTP");
        }

        OtpToken otpToken = otpTokenOpt.get();
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired. Please request a new one.");
        }

        Optional<User> userOptional = userRepository.findByEmail(request.getIdentifier());
        if (userOptional.isEmpty()) {
            userOptional = userRepository.findByPhoneNumber(request.getIdentifier());
        }

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            // Delete the OTP after successful reset
            otpTokenRepository.deleteByIdentifier(request.getIdentifier());
        } else {
            throw new com.fooddelivery.user_service.exception.UserNotFoundException("User not found");
        }
    }
}
