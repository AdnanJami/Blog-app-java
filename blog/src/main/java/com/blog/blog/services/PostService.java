package com.blog.blog.services;

import com.blog.blog.domain.dtos.PostDto;
import com.blog.blog.domain.dtos.PostRequest;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface PostService {
    // Published posts, newest first; categoryId and tagId are optional filters
    Page<PostDto> listPublishedPosts(UUID categoryId, UUID tagId, int page, int size);

    List<PostDto> listDrafts();

    PostDto getPost(UUID id);

    PostDto createPost(PostRequest request);

    PostDto updatePost(UUID id, PostRequest request);

    void deletePost(UUID id);
}
