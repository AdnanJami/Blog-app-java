package com.blog.blog.mappers;

import com.blog.blog.domain.dtos.AuthorDto;
import com.blog.blog.domain.dtos.PostDto;
import com.blog.blog.domain.entities.Post;
import com.blog.blog.domain.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {CategoryMapper.class, TagMapper.class})
public interface PostMapper {
    PostDto toDto(Post post);

    AuthorDto toAuthorDto(User user);
}
