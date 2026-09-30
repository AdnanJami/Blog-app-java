package com.blog.blog.controllers;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.entities.Category;
import com.blog.blog.mappers.CategoryMapper;
import com.blog.blog.services.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(path = "/api/v1/catagories")
@RequiredArgsConstructor
@Tag(name = "Blog",description = "API for managing Blog")
public class CategoryControllers {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;
    @GetMapping
    @Operation(summary = "GET CATEGORY")
    public ResponseEntity<List<CategoryDto>> listCategory(){
        List<CategoryDto> categories = categoryService.listCategories()
                .stream().map(categoryMapper::toDto)
                .toList();
        return ResponseEntity.ok(categories);
    }
}
