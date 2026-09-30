package com.blog.blog.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BlogApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void categoryLifecycle() throws Exception {
        String id = createCategory("Java").get("id").asText();

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Java')].postCount").value(hasItem(0)));

        postJson("/api/v1/categories", Map.of("name", " java "))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Category already exists: java"));

        postJson("/api/v1/categories", Map.of("name", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());

        mockMvc.perform(delete("/api/v1/categories/{id}", id)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/v1/categories/{id}", id)).andExpect(status().isNotFound());
    }

    @Test
    void tagsAreNormalisedAndReused() throws Exception {
        JsonNode first = readJson(postJson("/api/v1/tags", Map.of("names", List.of("React", " react", "Java")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("java"))
                .andExpect(jsonPath("$[1].name").value("react")));

        postJson("/api/v1/tags", Map.of("names", List.of("JAVA", "spring")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(first.get(0).get("id").asText()))
                .andExpect(jsonPath("$[1].name").value("spring"));

        postJson("/api/v1/tags", Map.of("names", List.of()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postLifecycle() throws Exception {
        String categoryId = createCategory("Backend").get("id").asText();
        String otherCategoryId = createCategory("Frontend").get("id").asText();
        JsonNode tags = readJson(postJson("/api/v1/tags", Map.of("names", List.of("spring", "jpa"))));
        String springTagId = tags.get(1).get("id").asText();
        String jpaTagId = tags.get(0).get("id").asText();

        // 450 words at 200 wpm rounds up to 3 minutes
        String content = "word ".repeat(450);
        JsonNode published = readJson(postJson("/api/v1/posts", postBody("Spring Data tips", content, categoryId,
                List.of(springTagId, jpaTagId), "PUBLISHED"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.readingTime").value(3))
                .andExpect(jsonPath("$.author.name").value("Blog Author"))
                .andExpect(jsonPath("$.category.name").value("Backend"))
                .andExpect(jsonPath("$.category.postCount").doesNotExist())
                .andExpect(jsonPath("$.tags", hasSize(2))));
        String publishedId = published.get("id").asText();

        String draftId = readJson(postJson("/api/v1/posts", postBody("Unfinished thoughts", "Still writing this one",
                categoryId, List.of(), "DRAFT"))
                .andExpect(status().isCreated())).get("id").asText();

        // Only published posts are listed, and filters narrow the results
        mockMvc.perform(get("/api/v1/posts").param("categoryId", categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].id").value(publishedId))
                .andExpect(jsonPath("$.page.totalElements").value(1));
        mockMvc.perform(get("/api/v1/posts").param("tagId", springTagId))
                .andExpect(jsonPath("$.content[*].id").value(hasItem(publishedId)))
                .andExpect(jsonPath("$.content[*].id").value(not(hasItem(draftId))));
        mockMvc.perform(get("/api/v1/posts").param("categoryId", otherCategoryId))
                .andExpect(jsonPath("$.content", hasSize(0)));

        mockMvc.perform(get("/api/v1/posts/drafts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItem(draftId)))
                .andExpect(jsonPath("$[*].id").value(not(hasItem(publishedId))));

        // Published post counts only include published posts
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(jsonPath("$[?(@.name == 'Backend')].postCount").value(hasItem(1)));
        mockMvc.perform(get("/api/v1/tags"))
                .andExpect(jsonPath("$[?(@.name == 'spring')].postCount").value(hasItem(1)));

        mockMvc.perform(put("/api/v1/posts/{id}", publishedId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postBody("Spring Data JPA tips", content,
                                otherCategoryId, List.of(jpaTagId), "PUBLISHED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Data JPA tips"))
                .andExpect(jsonPath("$.category.name").value("Frontend"))
                .andExpect(jsonPath("$.tags", hasSize(1)));

        // Categories and tags that are in use cannot be deleted
        mockMvc.perform(delete("/api/v1/categories/{id}", otherCategoryId)).andExpect(status().isConflict());
        mockMvc.perform(delete("/api/v1/tags/{id}", jpaTagId)).andExpect(status().isConflict());
        mockMvc.perform(delete("/api/v1/tags/{id}", springTagId)).andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/v1/posts/{id}", publishedId)).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/posts/{id}", publishedId)).andExpect(status().isNotFound());
    }

    @Test
    void invalidRequestsReturnProblemDetails() throws Exception {
        postJson("/api/v1/posts", Map.of())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.content").exists())
                .andExpect(jsonPath("$.errors.categoryId").exists())
                .andExpect(jsonPath("$.errors.status").exists());

        postJson("/api/v1/posts", postBody("A title", "Some content here", UUID.randomUUID().toString(),
                List.of(), "PUBLISHED"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/posts/not-a-uuid")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/posts").param("size", "500")).andExpect(status().isBadRequest());
        mockMvc.perform(post("/api/v1/posts").contentType(MediaType.APPLICATION_JSON).content("{broken"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void corsAllowsOnlyTheConfiguredFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/posts")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));

        mockMvc.perform(options("/api/v1/posts")
                        .header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    private JsonNode createCategory(String name) throws Exception {
        return readJson(postJson("/api/v1/categories", Map.of("name", name)).andExpect(status().isCreated()));
    }

    private static Map<String, Object> postBody(String title, String content, String categoryId,
                                                List<String> tagIds, String status) {
        return Map.of("title", title, "content", content, "categoryId", categoryId,
                "tagIds", tagIds, "status", status);
    }

    private ResultActions postJson(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private JsonNode readJson(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
