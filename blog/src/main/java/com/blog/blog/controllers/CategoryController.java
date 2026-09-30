package com.blog.blog.controllers;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.dtos.CreateCategoryRequest;
import com.blog.blog.services.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories",description = "API for managing blog categories")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List categories with their published post counts")
    public ResponseEntity<List<CategoryDto>> listCategories(){
        return ResponseEntity.ok(categoryService.listCategories());
    }

    @PostMapping
    @Operation(summary = "Create a category")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CreateCategoryRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category that has no posts")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id){
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
