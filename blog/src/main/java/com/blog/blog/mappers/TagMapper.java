package com.blog.blog.mappers;

import com.blog.blog.domain.dtos.TagDto;
import com.blog.blog.domain.entities.Tag;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TagMapper {
    // postCount comes from TagRepository#findAllWithPublishedPostCount, not from loading posts
    @Mapping(target = "postCount", ignore = true)
    TagDto toDto(Tag tag);
}
