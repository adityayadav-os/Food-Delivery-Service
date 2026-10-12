package com.fooddelivery.user_service.security.oauth2;

import com.fooddelivery.user_service.entity.RoleName;
import com.fooddelivery.user_service.entity.User;
import com.fooddelivery.user_service.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/oauth2/redirect}")
    private String redirectUri;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (name == null || name.isBlank()) {
            name = email != null ? email.split("@")[0] : "Google User";
        }

        User user = null;
        if (email != null) {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                user = userOptional.get();
            } else {
                user = new User();
                user.setEmail(email);
                user.setName(name);
                user.setRole(RoleName.ROLE_CUSTOMER);
                user = userRepository.save(user);
            }
        }

        String token = "Dummy-JWT-Token-For-Now";
        String userName = user != null && user.getName() != null ? user.getName() : name;
        String userEmail = email != null ? email : "";
        String userRole = user != null && user.getRole() != null ? user.getRole().name() : "ROLE_CUSTOMER";
        String userId = user != null && user.getId() != null ? String.valueOf(user.getId()) : "1";

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .queryParam("id", userId)
                .queryParam("name", userName)
                .queryParam("email", userEmail)
                .queryParam("role", userRole)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
