package com.blog.blog.repositories;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    @Query("""
            SELECT new com.blog.blog.domain.dtos.CategoryDto(c.id, c.name, COUNT(p))
            FROM Category c
            LEFT JOIN c.posts p ON p.status = com.blog.blog.domain.PostStatus.PUBLISHED
            GROUP BY c.id, c.name
            ORDER BY c.name
            """)
    List<CategoryDto> findAllWithPublishedPostCount();

    boolean existsByNameIgnoreCase(String name);
}
