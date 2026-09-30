package com.blog.blog.controllers;

import com.blog.blog.domain.dtos.PostDto;
import com.blog.blog.domain.dtos.PostRequest;
import com.blog.blog.services.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Posts",description = "API for managing blog posts")
public class PostController {

    private final PostService postService;

    @GetMapping
    @Operation(summary = "List published posts, newest first, optionally filtered by category and tag")
    public ResponseEntity<PagedModel<PostDto>> listPosts(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID tagId,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size){
        return ResponseEntity.ok(new PagedModel<>(postService.listPublishedPosts(categoryId, tagId, page, size)));
    }

    @GetMapping("/drafts")
    @Operation(summary = "List the current author's drafts")
    public ResponseEntity<List<PostDto>> listDrafts(){
        return ResponseEntity.ok(postService.listDrafts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a post")
    public ResponseEntity<PostDto> getPost(@PathVariable UUID id){
        return ResponseEntity.ok(postService.getPost(id));
    }

    @PostMapping
    @Operation(summary = "Create a post")
    public ResponseEntity<PostDto> createPost(@Valid @RequestBody PostRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a post")
    public ResponseEntity<PostDto> updatePost(@PathVariable UUID id, @Valid @RequestBody PostRequest request){
        return ResponseEntity.ok(postService.updatePost(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a post")
    public ResponseEntity<Void> deletePost(@PathVariable UUID id){
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
