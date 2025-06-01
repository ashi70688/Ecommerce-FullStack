package com.myapp.ecommerce.service;

import com.myapp.ecommerce.dto.AuthRequest;
import com.myapp.ecommerce.dto.RegisterRequest;
import com.myapp.ecommerce.model.Role;
import com.myapp.ecommerce.model.User;
import com.myapp.ecommerce.repository.UserRepository;
import com.myapp.ecommerce.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public String login(AuthRequest request) {
        try {
            log.info("Attempting login for user: {}", request.getEmail());
            
            // Check if user exists
            if (!userRepository.existsByEmail(request.getEmail())) {
                log.error("Login failed: User not found with email: {}", request.getEmail());
                throw new RuntimeException("Invalid email or password");
            }
            
            // Attempt authentication
            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );
            } catch (Exception e) {
                log.error("Authentication failed for user: {}", request.getEmail(), e);
                throw new RuntimeException("Invalid email or password");
            }
            
            // Set authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate and return JWT token
            return tokenProvider.createAccessToken(authentication);
        } catch (Exception e) {
            // Log the exception for debugging
            log.error("Error during login: ", e);
            throw new RuntimeException("Login failed: " + e.getMessage(), e);
        }
    }

    public String register(@Valid RegisterRequest request) {
        try {
            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }

            // Create and save the user
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .name(request.getName())
                    .role(Role.USER)
                    .enabled(true)
                    .build();

            user = userRepository.save(user);
            
            // Create authentication token manually instead of re-authenticating
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(request.getEmail(), null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Generate JWT token
            return tokenProvider.createAccessToken(authentication);
        } catch (Exception e) {
            // Log the exception for debugging
            log.error("Error during registration: ", e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    public User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                "anonymousUser".equals(authentication.getPrincipal())) {
                log.warn("No authenticated user found in security context");
                throw new RuntimeException("Not authenticated");
            }
            
            log.info("Getting current user for: {}", authentication.getName());
            return userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> {
                        log.error("User not found with email: {}", authentication.getName());
                        return new RuntimeException("User not found");
                    });
        } catch (Exception e) {
            log.error("Error getting current user: ", e);
            throw new RuntimeException("Failed to get current user: " + e.getMessage(), e);
        }
    }
}
