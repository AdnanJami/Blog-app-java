package com.blog.blog.services;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.dtos.CreateCategoryRequest;

import java.util.List;
import java.util.UUID;

public interface CategoryService {
    List<CategoryDto> listCategories();

    CategoryDto createCategory(CreateCategoryRequest request);

    void deleteCategory(UUID id);
}
