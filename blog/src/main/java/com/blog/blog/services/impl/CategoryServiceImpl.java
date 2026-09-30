package com.blog.blog.services.impl;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.dtos.CreateCategoryRequest;
import com.blog.blog.domain.entities.Category;
import com.blog.blog.exceptions.ConflictException;
import com.blog.blog.exceptions.ResourceNotFoundException;
import com.blog.blog.mappers.CategoryMapper;
import com.blog.blog.repositories.CategoryRepository;
import com.blog.blog.repositories.PostRepository;
import com.blog.blog.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDto> listCategories() {
        return categoryRepository.findAllWithPublishedPostCount();
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CreateCategoryRequest request) {
        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Category already exists: " + name);
        }
        Category saved = categoryRepository.save(Category.builder().name(name).build());
        CategoryDto dto = categoryMapper.toDto(saved);
        dto.setPostCount(0L);
        return dto;
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category not found with id " + id);
        }
        if (postRepository.existsByCategoryId(id)) {
            throw new ConflictException("Category has posts and cannot be deleted");
        }
        categoryRepository.deleteById(id);
    }
}
