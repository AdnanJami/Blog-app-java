package com.blog.blog.services;

import com.blog.blog.domain.entities.User;

import java.util.Optional;

public interface UserService {
    // The logged-in user; throws UnauthorizedException if the request isn't authenticated
    User getCurrentUser();

    // The logged-in user, or empty for anonymous requests
    Optional<User> findCurrentUser();
}
