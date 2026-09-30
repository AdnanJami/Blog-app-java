package com.blog.blog.services.impl;

import com.blog.blog.domain.dtos.AuthResponse;
import com.blog.blog.domain.dtos.LoginRequest;
import com.blog.blog.domain.dtos.RegisterRequest;
import com.blog.blog.domain.dtos.UserDto;
import com.blog.blog.domain.entities.User;
import com.blog.blog.exceptions.ConflictException;
import com.blog.blog.exceptions.UnauthorizedException;
import com.blog.blog.mappers.UserMapper;
import com.blog.blog.repositories.UserRepository;
import com.blog.blog.services.AuthService;
import com.blog.blog.services.TokenService;
import com.blog.blog.services.UserService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    private final UserRepository userRepository;
    private final UserService userService;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    // Checked against when the email is unknown, so both failure cases take the same time
    private String dummyPasswordHash;

    @PostConstruct
    void initDummyPasswordHash() {
        dummyPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("An account with this email already exists");
        }
        User user = userRepository.save(User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .build());
        return authResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Same message for unknown email and wrong password, so accounts can't be discovered this way
        User user = userRepository.findByEmail(normalizeEmail(request.getEmail())).orElse(null);
        String passwordHash = user != null ? user.getPassword() : dummyPasswordHash;
        if (!passwordEncoder.matches(request.getPassword(), passwordHash) || user == null) {
            throw new UnauthorizedException(INVALID_CREDENTIALS);
        }
        return authResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto currentUser() {
        return userMapper.toDto(userService.getCurrentUser());
    }

    private AuthResponse authResponse(User user) {
        TokenService.IssuedToken token = tokenService.issue(user);
        return AuthResponse.builder()
                .token(token.value())
                .expiresAt(token.expiresAt())
                .user(userMapper.toDto(user))
                .build();
    }

    private static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
