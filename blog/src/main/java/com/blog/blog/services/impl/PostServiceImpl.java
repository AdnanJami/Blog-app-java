package com.blog.blog.services.impl;

import com.blog.blog.domain.PostStatus;
import com.blog.blog.domain.dtos.PostDto;
import com.blog.blog.domain.dtos.PostRequest;
import com.blog.blog.domain.entities.Category;
import com.blog.blog.domain.entities.Post;
import com.blog.blog.domain.entities.Tag;
import com.blog.blog.domain.entities.User;
import com.blog.blog.exceptions.ResourceNotFoundException;
import com.blog.blog.mappers.PostMapper;
import com.blog.blog.repositories.CategoryRepository;
import com.blog.blog.repositories.PostRepository;
import com.blog.blog.repositories.TagRepository;
import com.blog.blog.services.PostService;
import com.blog.blog.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.blog.blog.repositories.PostSpecifications.hasStatus;
import static com.blog.blog.repositories.PostSpecifications.hasTag;
import static com.blog.blog.repositories.PostSpecifications.inCategory;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private static final int WORDS_PER_MINUTE = 200;
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "createdAt");

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserService userService;
    private final PostMapper postMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> listPublishedPosts(UUID categoryId, UUID tagId, int page, int size) {
        Specification<Post> spec = hasStatus(PostStatus.PUBLISHED);
        if (categoryId != null) {
            spec = spec.and(inCategory(categoryId));
        }
        if (tagId != null) {
            spec = spec.and(hasTag(tagId));
        }
        return postRepository.findAll(spec, PageRequest.of(page, size, NEWEST_FIRST))
                .map(postMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostDto> listDrafts() {
        User currentUser = userService.getCurrentUser();
        return postRepository.findAllByAuthorIdAndStatus(currentUser.getId(), PostStatus.DRAFT, NEWEST_FIRST)
                .stream()
                .map(postMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostDto getPost(UUID id) {
        Post post = findPost(id);
        // Drafts are only visible to their author
        if (post.getStatus() == PostStatus.DRAFT
                && !post.getAuthor().getId().equals(userService.getCurrentUser().getId())) {
            throw notFound(id);
        }
        return postMapper.toDto(post);
    }

    @Override
    @Transactional
    public PostDto createPost(PostRequest request) {
        Post post = new Post();
        post.setAuthor(userService.getCurrentUser());
        applyRequest(post, request);
        return postMapper.toDto(postRepository.save(post));
    }

    @Override
    @Transactional
    public PostDto updatePost(UUID id, PostRequest request) {
        Post post = findPost(id);
        applyRequest(post, request);
        // Flush so @PreUpdate refreshes updatedAt before the response is built
        return postMapper.toDto(postRepository.saveAndFlush(post));
    }

    @Override
    @Transactional
    public void deletePost(UUID id) {
        postRepository.delete(findPost(id));
    }

    private void applyRequest(Post post, PostRequest request) {
        post.setTitle(request.getTitle().trim());
        post.setContent(request.getContent());
        post.setStatus(request.getStatus());
        post.setReadingTime(calculateReadingTime(request.getContent()));
        post.setCategory(findCategory(request.getCategoryId()));
        post.setTags(findTags(request.getTagIds()));
    }

    private Post findPost(UUID id) {
        return postRepository.findById(id).orElseThrow(() -> notFound(id));
    }

    private Category findCategory(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + id));
    }

    private Set<Tag> findTags(Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new HashSet<>();
        }
        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(ids));
        if (tags.size() != ids.size()) {
            Set<UUID> found = tags.stream().map(Tag::getId).collect(Collectors.toSet());
            Set<UUID> missing = ids.stream().filter(id -> !found.contains(id)).collect(Collectors.toSet());
            throw new ResourceNotFoundException("Tags not found with ids " + missing);
        }
        return tags;
    }

    private static ResourceNotFoundException notFound(UUID id) {
        return new ResourceNotFoundException("Post not found with id " + id);
    }

    static int calculateReadingTime(String content) {
        String trimmed = content.trim();
        if (trimmed.isEmpty()) {
            return 1;
        }
        int words = trimmed.split("\\s+").length;
        return Math.max(1, (int) Math.ceil((double) words / WORDS_PER_MINUTE));
    }
}
