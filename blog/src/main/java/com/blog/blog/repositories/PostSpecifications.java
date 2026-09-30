package com.blog.blog.repositories;

import com.blog.blog.domain.PostStatus;
import com.blog.blog.domain.entities.Post;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class PostSpecifications {

    private PostSpecifications() {
    }

    public static Specification<Post> hasStatus(PostStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Post> inCategory(UUID categoryId) {
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Post> hasTag(UUID tagId) {
        return (root, query, cb) -> cb.equal(root.join("tags").get("id"), tagId);
    }
}
