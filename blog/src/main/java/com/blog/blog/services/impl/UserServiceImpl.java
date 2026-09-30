package com.blog.blog.services.impl;

import com.blog.blog.domain.entities.User;
import com.blog.blog.repositories.UserRepository;
import com.blog.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    // Until authentication is added, every post is written by this default author
    static final String DEFAULT_AUTHOR_EMAIL = "author@blog.local";
    static final String DEFAULT_AUTHOR_NAME = "Blog Author";

    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void createDefaultAuthorIfMissing() {
        if (userRepository.findByEmail(DEFAULT_AUTHOR_EMAIL).isEmpty()) {
            userRepository.save(User.builder()
                    .email(DEFAULT_AUTHOR_EMAIL)
                    .name(DEFAULT_AUTHOR_NAME)
                    .password("")
                    .build());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        return userRepository.findByEmail(DEFAULT_AUTHOR_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Default author has not been created"));
    }
}
