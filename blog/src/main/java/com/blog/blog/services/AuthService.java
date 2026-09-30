package com.blog.blog.services;

import com.blog.blog.domain.dtos.AuthResponse;
import com.blog.blog.domain.dtos.LoginRequest;
import com.blog.blog.domain.dtos.RegisterRequest;
import com.blog.blog.domain.dtos.UserDto;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserDto currentUser();
}
