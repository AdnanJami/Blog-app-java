# Blog-app-java

A full-stack blogging platform with a Spring Boot REST API and a Next.js frontend. Authors write posts, organize them into categories, label them with tags, and publish them when they're ready. Readers browse and filter posts by category or tag.

> **Status:** in development. The REST API for posts, categories and tags is in place; the frontend still runs on mock data until it's connected to the API.

## Tech stack

| Layer    | Technology                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| Backend  | Java 21, Spring Boot 3.5, Spring Data JPA, Bean Validation, Lombok, MapStruct |
| API docs | springdoc OpenAPI (Swagger UI)                                                 |
| Database | PostgreSQL (H2 available for tests)                                            |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4                               |
| Tooling  | Maven, npm, Docker Compose                                                     |

## Project structure

```
.
├── blog/                     # Spring Boot backend
│   └── src/main/java/com/blog/blog/
│       ├── controllers/      # REST controllers
│       ├── domain/
│       │   ├── entities/     # JPA entities: Post, Category, Tag, User
│       │   └── dtos/         # Request/response objects
│       ├── mappers/          # MapStruct entity <-> DTO mappers
│       ├── repositories/     # Spring Data repositories
│       └── services/         # Business logic
├── frontend/blog-platform/   # Next.js frontend
│   └── src/
│       ├── app/              # Pages: home, /categories, /tags
│       ├── components/       # Navbar, PostCard, PostsGrid, ...
│       └── lib/api.ts        # API client
└── docker-compose.yml        # PostgreSQL + Adminer
```

## Domain model

- **Post**: title, content, status (`DRAFT` / `PUBLISHED`), reading time, and created/updated timestamps. Each post has one author and one category and can have many tags.
- **Category**: a unique name; a category holds many posts.
- **Tag**: a unique name; tags and posts are many-to-many.
- **User**: name, email and password; a user authors many posts.

## Getting started

### Prerequisites

- Java 21
- Node.js 20+
- Docker

### 1. Start the database

```bash
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` and Adminer (a web database UI) on [http://localhost:8888](http://localhost:8888).

> **Port 5432 already in use?** If PostgreSQL is also installed locally, it will take `localhost:5432` and the backend will fail with `password authentication failed`. Run the container on another port and point the backend at it:
>
> ```bash
> DB_PORT=5433 docker compose up -d
> DB_URL=jdbc:postgresql://127.0.0.1:5433/postgres ./mvnw spring-boot:run
> ```

### 2. Run the backend

```bash
cd blog
./mvnw spring-boot:run
```

The API runs on [http://localhost:8081](http://localhost:8081). Tables are created automatically on startup.

Database settings default to the Docker Compose database and can be overridden with environment variables:

| Variable      | Default                                     |
| ------------- | ------------------------------------------- |
| `DB_URL`      | `jdbc:postgresql://127.0.0.1:5432/postgres` |
| `DB_USERNAME` | `postgres`                                  |
| `DB_PASSWORD` | `example`                                   |

Interactive API docs are at [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html).

### 3. Run the frontend

```bash
cd frontend/blog-platform
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
cd blog
./mvnw test
```

Tests use an in-memory H2 database, so Docker doesn't need to be running.

## API

All endpoints are under `/api/v1`. Until authentication is added, every post is written by a default author that is created on startup.

### Categories

| Method | Endpoint           | Description                                               |
| ------ | ------------------ | --------------------------------------------------------- |
| GET    | `/categories`      | List categories with their published post counts          |
| POST   | `/categories`      | Create a category: `{"name": "Java"}`                     |
| DELETE | `/categories/{id}` | Delete a category (only if it has no posts)               |

### Tags

| Method | Endpoint     | Description                                                                     |
| ------ | ------------ | ------------------------------------------------------------------------------- |
| GET    | `/tags`      | List tags with their published post counts                                      |
| POST   | `/tags`      | Create tags: `{"names": ["java", "spring"]}`; existing tags are returned as-is  |
| DELETE | `/tags/{id}` | Delete a tag (only if no post uses it)                                          |

Tag names are stored trimmed and lower-case.

### Posts

| Method | Endpoint        | Description                                                               |
| ------ | --------------- | ------------------------------------------------------------------------- |
| GET    | `/posts`        | Published posts, newest first. Query params: `categoryId`, `tagId`, `page` (default 0), `size` (default 10, max 100) |
| GET    | `/posts/drafts` | The current author's drafts                                               |
| GET    | `/posts/{id}`   | A single post (drafts only for their author)                              |
| POST   | `/posts`        | Create a post                                                             |
| PUT    | `/posts/{id}`   | Update a post                                                             |
| DELETE | `/posts/{id}`   | Delete a post                                                             |

Create and update take the same body. Reading time is calculated on the server at 200 words per minute.

```json
{
  "title": "Getting started with Spring Data JPA",
  "content": "Post body...",
  "categoryId": "3f1c...",
  "tagIds": ["9a2b...", "c41d..."],
  "status": "PUBLISHED"
}
```

### Errors

Errors use the standard [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807) problem format. Validation errors also list each invalid field:

```json
{
  "status": 400,
  "title": "Bad Request",
  "detail": "Validation failed",
  "errors": { "title": "Title is required", "categoryId": "Category id is required" }
}
```

| Status | When                                                          |
| ------ | ------------------------------------------------------------- |
| 400    | Invalid body, malformed JSON, or bad query/path parameter     |
| 404    | The post, category or tag doesn't exist                       |
| 409    | Duplicate category, or deleting a category/tag that's in use  |

## Roadmap

- [x] **Fixes**: correct the categories endpoint path, fix entity builder defaults, efficient post-count queries, database credentials from environment variables, tests on H2
- [x] **Core API**: full CRUD for posts, categories and tags; filtering and pagination; validation and consistent error responses
- [ ] **Frontend integration**: replace mock data with real API calls, CORS, post detail page
- [ ] **Authentication**: JWT login and registration, author-only editing, private drafts, post editor
- [ ] **Deployment**: Dockerized backend and frontend, CI with GitHub Actions, Flyway migrations
