package com.blog.blog.services.impl;

import com.blog.blog.domain.entities.Category;
import com.blog.blog.repositories.CategoryRepository;
import com.blog.blog.services.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    @Override
    public List<Category> listCategories() {
        return categoryRepository.findAllWithPostCount();
    }
}
