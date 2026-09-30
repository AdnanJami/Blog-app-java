package com.blog.blog.controllers;

import com.blog.blog.domain.dtos.CategoryDto;
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
@RequestMapping(path = "/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories",description = "API for managing blog categories")
public class CategoryControllers {

    private final CategoryService categoryService;
    @GetMapping
    @Operation(summary = "List categories with their published post counts")
    public ResponseEntity<List<CategoryDto>> listCategory(){
        return ResponseEntity.ok(categoryService.listCategories());
    }
}
