package com.blog.blog.mappers;

import com.blog.blog.domain.dtos.CategoryDto;
import com.blog.blog.domain.entities.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {
    // postCount comes from CategoryRepository#findAllWithPublishedPostCount, not from loading posts
    @Mapping(target = "postCount", ignore = true)
    CategoryDto toDto(Category category);
}
