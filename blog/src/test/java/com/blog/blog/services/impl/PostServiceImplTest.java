package com.blog.blog.services.impl;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PostServiceImplTest {

    @Test
    void readingTimeRoundsUpAndIsAtLeastOneMinute() {
        assertThat(PostServiceImpl.calculateReadingTime("   ")).isEqualTo(1);
        assertThat(PostServiceImpl.calculateReadingTime("just a few words")).isEqualTo(1);
        assertThat(PostServiceImpl.calculateReadingTime("word ".repeat(200))).isEqualTo(1);
        assertThat(PostServiceImpl.calculateReadingTime("word ".repeat(201))).isEqualTo(2);
        assertThat(PostServiceImpl.calculateReadingTime("word\n\n\tword ".repeat(300))).isEqualTo(3);
    }
}
