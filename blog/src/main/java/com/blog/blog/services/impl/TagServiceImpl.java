package com.blog.blog.services.impl;

import com.blog.blog.domain.dtos.TagDto;
import com.blog.blog.domain.entities.Tag;
import com.blog.blog.exceptions.ConflictException;
import com.blog.blog.exceptions.ResourceNotFoundException;
import com.blog.blog.mappers.TagMapper;
import com.blog.blog.repositories.PostRepository;
import com.blog.blog.repositories.TagRepository;
import com.blog.blog.services.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;
    private final PostRepository postRepository;
    private final TagMapper tagMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TagDto> listTags() {
        return tagRepository.findAllWithPublishedPostCount();
    }

    @Override
    @Transactional
    public List<TagDto> createTags(Set<String> names) {
        // Tags are stored trimmed and lower-case so "React" and "react " are the same tag
        Set<String> normalized = names.stream()
                .map(name -> name.trim().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        List<Tag> tags = new ArrayList<>(tagRepository.findByLowerCaseNameIn(normalized));
        Set<String> existingNames = tags.stream()
                .map(tag -> tag.getName().toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());

        List<Tag> newTags = normalized.stream()
                .filter(name -> !existingNames.contains(name))
                .map(name -> Tag.builder().name(name).build())
                .toList();
        tags.addAll(tagRepository.saveAll(newTags));

        return tags.stream()
                .sorted(Comparator.comparing(Tag::getName))
                .map(tagMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void deleteTag(UUID id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found with id " + id);
        }
        if (postRepository.existsByTagsId(id)) {
            throw new ConflictException("Tag is used by posts and cannot be deleted");
        }
        tagRepository.deleteById(id);
    }
}
