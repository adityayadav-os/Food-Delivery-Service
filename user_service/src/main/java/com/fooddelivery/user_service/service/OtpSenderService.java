package com.fooddelivery.user_service.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpSenderService {

    private final JavaMailSender mailSender;

    public OtpSenderService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String identifier, String otp) {
        if (identifier.contains("@")) {
            // It's an email
            sendEmailOtp(identifier, otp);
        } else {
            // It's a phone number
            sendSmsOtp(identifier, otp);
        }
    }

    private void sendEmailOtp(String email, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("adityayadav9555209603@gmail.com");
            message.setTo(email);
            message.setSubject("Food Delivery App - Password Reset OTP");
            message.setText("Your OTP for password reset is: " + otp + "\nIt is valid for 10 minutes.");
            mailSender.send(message);
            System.out.println("=====================================");
            System.out.println("EMAIL OTP SENT TO " + email);
            System.out.println("OTP IS: " + otp);
            System.out.println("=====================================");
            System.out.println("Email sent successfully to: " + email);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email. Please check SMTP configuration.");
        }
    }

    private void sendSmsOtp(String phoneNumber, String otp) {
        // Here you would integrate a 3rd party service like Twilio, Fast2SMS, Msg91 etc.
        // Since we don't have API keys right now, we just mock it in console.
        System.out.println("=====================================");
        System.out.println("SMS SENT TO " + phoneNumber);
        System.out.println("MESSAGE: Your OTP is " + otp);
        System.out.println("=====================================");
    }
}
