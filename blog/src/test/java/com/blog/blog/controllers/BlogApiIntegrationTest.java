package com.blog.blog.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
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

    // Token of the user most tests act as
    private String token;

    @BeforeEach
    void registerDefaultUser() throws Exception {
        token = register("Ada Lovelace", "ada@example.com");
    }

    @Test
    void registerLoginAndMe() throws Exception {
        postJson("/api/v1/auth/login", Map.of("email", " ADA@example.com ", "password", "password123"), null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiresAt").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("ada@example.com"))
                .andExpect(jsonPath("$.user.password").doesNotExist());

        mockMvc.perform(authorized(get("/api/v1/auth/me"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ada Lovelace"));

        postJson("/api/v1/auth/login", Map.of("email", "ada@example.com", "password", "wrong-password"), null)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));
        postJson("/api/v1/auth/login", Map.of("email", "nobody@example.com", "password", "password123"), null)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password"));

        postJson("/api/v1/auth/register",
                Map.of("name", "Ada Again", "email", "Ada@Example.com", "password", "password123"), null)
                .andExpect(status().isConflict());
        postJson("/api/v1/auth/register", Map.of("name", "A", "email", "not-an-email", "password", "short"), null)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void readsArePublicButWritesNeedAValidToken() throws Exception {
        mockMvc.perform(get("/api/v1/posts")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/categories")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/tags")).andExpect(status().isOk());

        postJson("/api/v1/categories", Map.of("name", "Anonymous"), null)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        postJson("/api/v1/categories", Map.of("name", "Forged"), "not-a-real-token")
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/posts/drafts")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void categoryLifecycle() throws Exception {
        String id = createCategory("Java").get("id").asText();

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Java')].postCount").value(hasItem(0)));

        postJson("/api/v1/categories", Map.of("name", " java "), token)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Category already exists: java"));

        postJson("/api/v1/categories", Map.of("name", ""), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists());

        mockMvc.perform(authorized(delete("/api/v1/categories/{id}", id), token)).andExpect(status().isNoContent());
        mockMvc.perform(authorized(delete("/api/v1/categories/{id}", id), token)).andExpect(status().isNotFound());
    }

    @Test
    void tagsAreNormalisedAndReused() throws Exception {
        JsonNode first = readJson(postJson("/api/v1/tags", Map.of("names", List.of("React", " react", "Java")), token)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name").value("java"))
                .andExpect(jsonPath("$[1].name").value("react")));

        postJson("/api/v1/tags", Map.of("names", List.of("JAVA", "spring")), token)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(first.get(0).get("id").asText()))
                .andExpect(jsonPath("$[1].name").value("spring"));

        postJson("/api/v1/tags", Map.of("names", List.of()), token)
                .andExpect(status().isBadRequest());
    }

    @Test
    void postLifecycle() throws Exception {
        String categoryId = createCategory("Backend").get("id").asText();
        String otherCategoryId = createCategory("Frontend").get("id").asText();
        JsonNode tags = readJson(postJson("/api/v1/tags", Map.of("names", List.of("spring", "jpa")), token));
        String springTagId = tags.get(1).get("id").asText();
        String jpaTagId = tags.get(0).get("id").asText();

        // 450 words at 200 wpm rounds up to 3 minutes
        String content = "word ".repeat(450);
        JsonNode published = readJson(postJson("/api/v1/posts", postBody("Spring Data tips", content, categoryId,
                List.of(springTagId, jpaTagId), "PUBLISHED"), token)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.readingTime").value(3))
                .andExpect(jsonPath("$.author.name").value("Ada Lovelace"))
                .andExpect(jsonPath("$.category.name").value("Backend"))
                .andExpect(jsonPath("$.category.postCount").doesNotExist())
                .andExpect(jsonPath("$.tags", hasSize(2))));
        String publishedId = published.get("id").asText();

        String draftId = readJson(postJson("/api/v1/posts", postBody("Unfinished thoughts", "Still writing this one",
                categoryId, List.of(), "DRAFT"), token)
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

        mockMvc.perform(authorized(get("/api/v1/posts/drafts"), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id").value(hasItem(draftId)))
                .andExpect(jsonPath("$[*].id").value(not(hasItem(publishedId))));

        // Published post counts only include published posts
        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(jsonPath("$[?(@.name == 'Backend')].postCount").value(hasItem(1)));
        mockMvc.perform(get("/api/v1/tags"))
                .andExpect(jsonPath("$[?(@.name == 'spring')].postCount").value(hasItem(1)));

        mockMvc.perform(authorized(put("/api/v1/posts/{id}", publishedId), token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postBody("Spring Data JPA tips", content,
                                otherCategoryId, List.of(jpaTagId), "PUBLISHED"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Data JPA tips"))
                .andExpect(jsonPath("$.category.name").value("Frontend"))
                .andExpect(jsonPath("$.tags", hasSize(1)));

        // Categories and tags that are in use cannot be deleted
        mockMvc.perform(authorized(delete("/api/v1/categories/{id}", otherCategoryId), token))
                .andExpect(status().isConflict());
        mockMvc.perform(authorized(delete("/api/v1/tags/{id}", jpaTagId), token)).andExpect(status().isConflict());
        mockMvc.perform(authorized(delete("/api/v1/tags/{id}", springTagId), token)).andExpect(status().isNoContent());

        mockMvc.perform(authorized(delete("/api/v1/posts/{id}", publishedId), token))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/v1/posts/{id}", publishedId)).andExpect(status().isNotFound());
    }

    @Test
    void onlyTheAuthorCanChangeAPostOrSeeItsDrafts() throws Exception {
        String categoryId = createCategory("Security").get("id").asText();
        String postId = readJson(postJson("/api/v1/posts",
                postBody("Ada's post", "Some content here", categoryId, List.of(), "PUBLISHED"), token))
                .get("id").asText();
        String draftId = readJson(postJson("/api/v1/posts",
                postBody("Ada's draft", "Some content here", categoryId, List.of(), "DRAFT"), token))
                .get("id").asText();

        String otherToken = register("Grace Hopper", "grace@example.com");

        mockMvc.perform(authorized(put("/api/v1/posts/{id}", postId), otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                postBody("Hijacked", "Some content here", categoryId, List.of(), "PUBLISHED"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.detail").value("Only the author can change this post"));
        mockMvc.perform(authorized(delete("/api/v1/posts/{id}", postId), otherToken))
                .andExpect(status().isForbidden());

        // Drafts look like they don't exist to anyone but the author
        mockMvc.perform(get("/api/v1/posts/{id}", draftId)).andExpect(status().isNotFound());
        mockMvc.perform(authorized(get("/api/v1/posts/{id}", draftId), otherToken)).andExpect(status().isNotFound());
        mockMvc.perform(authorized(get("/api/v1/posts/drafts"), otherToken))
                .andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(authorized(get("/api/v1/posts/{id}", draftId), token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void invalidRequestsReturnProblemDetails() throws Exception {
        postJson("/api/v1/posts", Map.of(), token)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.content").exists())
                .andExpect(jsonPath("$.errors.categoryId").exists())
                .andExpect(jsonPath("$.errors.status").exists());

        postJson("/api/v1/posts", postBody("A title", "Some content here", UUID.randomUUID().toString(),
                List.of(), "PUBLISHED"), token)
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/posts/not-a-uuid")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/posts").param("size", "500")).andExpect(status().isBadRequest());
        mockMvc.perform(authorized(post("/api/v1/posts"), token)
                        .contentType(MediaType.APPLICATION_JSON).content("{broken"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void corsAllowsOnlyTheConfiguredFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/posts")
                        .header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "authorization,content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));

        mockMvc.perform(options("/api/v1/posts")
                        .header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }

    private String register(String name, String email) throws Exception {
        JsonNode response = readJson(postJson("/api/v1/auth/register",
                Map.of("name", name, "email", email, "password", "password123"), null)
                .andExpect(status().isCreated()));
        return response.get("token").asText();
    }

    private JsonNode createCategory(String name) throws Exception {
        return readJson(postJson("/api/v1/categories", Map.of("name", name), token).andExpect(status().isCreated()));
    }

    private static Map<String, Object> postBody(String title, String content, String categoryId,
                                                List<String> tagIds, String status) {
        return Map.of("title", title, "content", content, "categoryId", categoryId,
                "tagIds", tagIds, "status", status);
    }

    private static MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder request, String token) {
        return token == null ? request : request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    private ResultActions postJson(String url, Object body, String token) throws Exception {
        return mockMvc.perform(authorized(post(url), token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body)));
    }

    private JsonNode readJson(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
