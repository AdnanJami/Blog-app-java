package com.blog.blog.services;

import com.blog.blog.domain.dtos.CategoryDto;

import java.util.List;

public interface CategoryService {
    List<CategoryDto> listCategories();
}
