package com.blog.blog.repositories;

import com.blog.blog.domain.PostStatus;
import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.entities.Category;
import com.blog.blog.domain.entities.Post;
import com.blog.blog.domain.entities.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class CategoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void countsOnlyPublishedPostsAndIncludesEmptyCategories() {
        User author = entityManager.persist(User.builder()
                .name("Author").email("author@example.com").password("secret").build());
        Category java = entityManager.persist(Category.builder().name("Java").build());
        Category empty = entityManager.persist(Category.builder().name("Empty").build());

        entityManager.persist(post("Published 1", PostStatus.PUBLISHED, author, java));
        entityManager.persist(post("Published 2", PostStatus.PUBLISHED, author, java));
        entityManager.persist(post("Draft", PostStatus.DRAFT, author, java));
        entityManager.flush();

        List<CategoryDto> categories = categoryRepository.findAllWithPublishedPostCount();

        assertThat(categories)
                .extracting(CategoryDto::getName, CategoryDto::getPostCount)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("Empty", 0L),
                        org.assertj.core.groups.Tuple.tuple("Java", 2L));
        assertThat(author.getCreatedAt()).isNotNull();
        assertThat(empty.getPosts()).isNotNull();
    }

    private Post post(String title, PostStatus status, User author, Category category) {
        return Post.builder()
                .title(title)
                .content("content")
                .status(status)
                .readingTime(1)
                .author(author)
                .category(category)
                .build();
    }
}
