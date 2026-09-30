package com.blog.blog.services;

import com.blog.blog.domain.dtos.TagDto;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TagService {
    List<TagDto> listTags();

    // Returns the tags for the given names, creating any that don't exist yet
    List<TagDto> createTags(Set<String> names);

    void deleteTag(UUID id);
}
