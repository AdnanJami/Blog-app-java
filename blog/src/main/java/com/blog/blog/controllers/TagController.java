package com.blog.blog.controllers;

import com.blog.blog.domain.dtos.CreateTagsRequest;
import com.blog.blog.domain.dtos.TagDto;
import com.blog.blog.services.TagService;
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
@RequestMapping(path = "/api/v1/tags")
@RequiredArgsConstructor
@Tag(name = "Tags",description = "API for managing blog tags")
public class TagController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "List tags with their published post counts")
    public ResponseEntity<List<TagDto>> listTags(){
        return ResponseEntity.ok(tagService.listTags());
    }

    @PostMapping
    @Operation(summary = "Create tags; names that already exist are returned as-is")
    public ResponseEntity<List<TagDto>> createTags(@Valid @RequestBody CreateTagsRequest request){
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTags(request.getNames()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tag that no post uses")
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id){
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
