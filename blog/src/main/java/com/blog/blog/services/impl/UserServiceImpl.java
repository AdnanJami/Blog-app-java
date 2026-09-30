package com.blog.blog.services.impl;

import com.blog.blog.domain.entities.User;
import com.blog.blog.exceptions.UnauthorizedException;
import com.blog.blog.repositories.UserRepository;
import com.blog.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        return findCurrentUser().orElseThrow(() -> new UnauthorizedException("Authentication is required"));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken token)) {
            return Optional.empty();
        }
        // The token subject is the user id (see TokenService); a deleted user simply isn't found
        return userRepository.findById(UUID.fromString(token.getName()));
    }
}
