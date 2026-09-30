package com.blog.blog.repositories;

import com.blog.blog.domain.dtos.TagDto;
import com.blog.blog.domain.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    @Query("""
            SELECT new com.blog.blog.domain.dtos.TagDto(t.id, t.name, COUNT(p))
            FROM Tag t
            LEFT JOIN t.posts p ON p.status = com.blog.blog.domain.PostStatus.PUBLISHED
            GROUP BY t.id, t.name
            ORDER BY t.name
            """)
    List<TagDto> findAllWithPublishedPostCount();

    // Expects lower-case names
    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) IN :names")
    List<Tag> findByLowerCaseNameIn(@Param("names") Collection<String> names);
}
