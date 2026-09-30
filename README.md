# Blog-app-java

A full-stack blogging platform with a Spring Boot REST API and a Next.js frontend. Authors write posts, organize them into categories, label them with tags, and publish them when they're ready. Readers browse and filter posts by category or tag.

> **Status:** early development. The data model and the categories endpoint are in place; the frontend currently runs on mock data while the rest of the API is built out.

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

### 2. Run the backend

```bash
cd blog
./mvnw spring-boot:run
```

The API runs on [http://localhost:8081](http://localhost:8081). Tables are created automatically on startup.

Interactive API docs are at [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html).

### 3. Run the frontend

```bash
cd frontend/blog-platform
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

| Method | Endpoint              | Description                         |
| ------ | --------------------- | ----------------------------------- |
| GET    | `/api/v1/catagories`  | List all categories with post counts |

More endpoints are on the roadmap below.

## Roadmap

- [ ] **Fixes**: correct the categories endpoint path, fix entity builder defaults, efficient post-count queries, database credentials from environment variables, tests on H2
- [ ] **Core API**: full CRUD for posts, categories and tags; filtering and pagination; validation and consistent error responses
- [ ] **Frontend integration**: replace mock data with real API calls, CORS, post detail page
- [ ] **Authentication**: JWT login and registration, author-only editing, private drafts, post editor
- [ ] **Deployment**: Dockerized backend and frontend, CI with GitHub Actions, Flyway migrations
