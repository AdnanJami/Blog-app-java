package com.blog.blog.repositories;

import com.blog.blog.domain.PostStatus;
import com.blog.blog.domain.entities.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {

    // Tags are left lazy (batch-fetched) because fetch-joining a collection breaks pagination
    @Override
    @EntityGraph(attributePaths = {"author", "category"})
    Page<Post> findAll(Specification<Post> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    List<Post> findAllByAuthorIdAndStatus(UUID authorId, PostStatus status, Sort sort);

    boolean existsByCategoryId(UUID categoryId);

    boolean existsByTagsId(UUID tagId);
}
