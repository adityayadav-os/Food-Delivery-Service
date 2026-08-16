package com.fooddelivery.user_service.config;

import com.fooddelivery.user_service.entity.RoleName;
import com.fooddelivery.user_service.entity.User;
import com.fooddelivery.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.admin.email}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if Admin exists
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail(adminEmail);
            admin.setPhoneNumber("9999999999");
            
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setAddress("System Admin");
            admin.setRole(RoleName.ROLE_ADMIN);

            userRepository.save(admin);
            System.out.println("Super Admin Account Seeded: " + adminEmail);
        }
    }
}
