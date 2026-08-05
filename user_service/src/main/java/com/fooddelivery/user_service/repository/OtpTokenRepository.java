package com.fooddelivery.user_service.repository;

import com.fooddelivery.user_service.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByIdentifierAndOtp(String identifier, String otp);
    void deleteByIdentifier(String identifier);
}
