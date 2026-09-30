# Blog-app-java

A full-stack blogging platform with a Spring Boot REST API and a Next.js frontend. Authors write posts, organize them into categories, label them with tags, and publish them when they're ready. Readers browse and filter posts by category or tag.

> **Status:** in development. Readers can browse, filter and read posts; registered authors can write, edit, publish and delete their own posts.

## Tech stack

| Layer    | Technology                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| Backend  | Java 21, Spring Boot 3.5, Spring Data JPA, Bean Validation, Lombok, MapStruct |
| API docs | springdoc OpenAPI (Swagger UI)                                                 |
| Security | Spring Security, JWT (OAuth2 resource server), BCrypt                          |
| Database | PostgreSQL 18, Flyway migrations (H2 for tests)                                |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4                               |
| Tooling  | Maven, npm, Docker / Docker Compose, GitHub Actions                            |

## Project structure

```
.
├── .github/workflows/ci.yml  # CI: backend tests, frontend lint/build, Docker image builds
├── blog/                     # Spring Boot backend (+ Dockerfile)
│   └── src/main/
│       ├── java/com/blog/blog/
│       │   ├── config/       # Security (JWT), CORS
│       │   ├── controllers/  # REST controllers
│       │   ├── domain/
│       │   │   ├── entities/ # JPA entities: Post, Category, Tag, User
│       │   │   └── dtos/     # Request/response objects
│       │   ├── exceptions/   # Error types and the problem-detail handler
│       │   ├── mappers/      # MapStruct entity <-> DTO mappers
│       │   ├── repositories/ # Spring Data repositories
│       │   └── services/     # Business logic
│       └── resources/db/migration/  # Flyway SQL migrations
├── frontend/blog-platform/   # Next.js frontend (+ Dockerfile)
│   └── src/
│       ├── app/              # Pages and Server Actions (app/actions)
│       ├── components/       # Navbar, PostCard, PostsGrid, PostEditor, ...
│       └── lib/              # API client, session cookie, auth and formatting helpers
└── docker-compose.yml        # PostgreSQL + Adminer; backend + frontend with --profile app
```

## Domain model

- **Post**: title, content, status (`DRAFT` / `PUBLISHED`), reading time, and created/updated timestamps. Each post has one author and one category and can have many tags.
- **Category**: a unique name; a category holds many posts.
- **Tag**: a unique name; tags and posts are many-to-many.
- **User**: name, email and password; a user authors many posts.

## Getting started

### Quick start: everything in Docker

Only Docker is needed:

```bash
docker compose --profile app up -d --build
```

This builds and starts the whole stack:

| Service  | URL                                                    |
| -------- | ------------------------------------------------------ |
| Frontend | [http://localhost:3000](http://localhost:3000)         |
| API      | [http://localhost:8081/api/v1](http://localhost:8081/api/v1) ([Swagger UI](http://localhost:8081/swagger-ui.html)) |
| Adminer  | [http://localhost:8888](http://localhost:8888) (server `db`, user `postgres`, password `example`) |

Stop it with `docker compose --profile app down`. Database data is kept in the `db-data` volume; add `-v` to delete it too.

For anything beyond local use, set `JWT_SECRET` (and `DB_PASSWORD`) in your environment or a `.env` file next to `docker-compose.yml`. `PUBLIC_API_URL` sets where the browser reaches the API (default `http://localhost:8081/api/v1`).

### Local development

#### Prerequisites

- Java 21
- Node.js 20.9+
- Docker (for the database)

#### 1. Start the database

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

#### 2. Run the backend

```bash
cd blog
./mvnw spring-boot:run
```

The API runs on [http://localhost:8081](http://localhost:8081). On startup, [Flyway](https://documentation.red-gate.com/flyway) applies any pending migrations from `src/main/resources/db/migration`; Hibernate only validates that the schema matches the entities. To change the schema, add a new file such as `V3__add_post_slug.sql` — never edit a migration that has already been applied. Databases created before migrations were introduced are detected and marked as being at version 1 automatically.

Database settings default to the Docker Compose database and can be overridden with environment variables:

| Variable      | Default                                     |
| ------------- | ------------------------------------------- |
| `DB_URL`      | `jdbc:postgresql://127.0.0.1:5432/postgres` |
| `DB_USERNAME` | `postgres`                                  |
| `DB_PASSWORD` | `example`                                   |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000`                |
| `JWT_SECRET`  | a development-only value; **set your own (32+ characters) outside local development** |
| `JWT_EXPIRATION` | `PT24H` (how long a login lasts)         |

Interactive API docs are at [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html).

#### 3. Run the frontend

```bash
cd frontend/blog-platform
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend calls the API at `http://localhost:8081/api/v1` by default. To point it elsewhere, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`. The backend only accepts browser requests from the origins in `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`, comma-separated).

**Pages**

| Route          | Description                                                                       |
| -------------- | --------------------------------------------------------------------------------- |
| `/`            | Published posts with category tabs and "Load more"; filter with `?categoryId=` and `?tagId=` |
| `/posts/{id}`  | A single post                                                                     |
| `/categories`  | All categories with post counts; each links to its filtered feed                  |
| `/tags`        | All tags with post counts; each links to its filtered feed                        |
| `/login`, `/register` | Log in or create an account                                                |
| `/posts/new`   | Write a post (save as draft or publish)                                           |
| `/posts/{id}/edit` | Edit your own post                                                            |
| `/drafts`      | Your unpublished drafts                                                           |

Logging in stores the API token in an httpOnly cookie, so browser scripts can't read it; the Next.js server attaches it to API calls.

### Running tests

```bash
cd blog
./mvnw test
```

Tests use an in-memory H2 database (with the same Flyway migrations), so Docker doesn't need to be running.

### Continuous integration

[GitHub Actions](.github/workflows/ci.yml) runs on every push to `main` and `dev` and on pull requests: backend tests, frontend lint + type check + production build, and a build of both Docker images.

## API

All endpoints are under `/api/v1`. Reading is public; everything that changes data needs a token from `/auth/register` or `/auth/login`, sent as `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint         | Description                                                                 |
| ------ | ---------------- | --------------------------------------------------------------------------- |
| POST   | `/auth/register` | `{"name", "email", "password"}` (password 8–72 characters) → `{token, expiresAt, user}` |
| POST   | `/auth/login`    | `{"email", "password"}` → `{token, expiresAt, user}`                        |
| GET    | `/auth/me`       | The logged-in user (token required)                                         |

Only a post's author can update or delete it. Drafts are visible only to their author; for anyone else they return 404.

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
| GET    | `/posts/drafts` | Your drafts (token required)                                              |
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
| 401    | Missing, invalid or expired token; wrong email or password    |
| 403    | Changing someone else's post                                  |
| 404    | The post, category or tag doesn't exist                       |
| 409    | Duplicate category, or deleting a category/tag that's in use  |

## Roadmap

- [x] **Fixes**: correct the categories endpoint path, fix entity builder defaults, efficient post-count queries, database credentials from environment variables, tests on H2
- [x] **Core API**: full CRUD for posts, categories and tags; filtering and pagination; validation and consistent error responses
- [x] **Frontend integration**: replace mock data with real API calls, CORS, post detail page
- [x] **Authentication**: JWT login and registration, author-only editing, private drafts, post editor
- [x] **Deployment**: Dockerized backend and frontend, CI with GitHub Actions, Flyway migrations
