-- Initial schema, matching what Hibernate generated before migrations were introduced.
-- Kept portable so it also runs on the H2 database used by the tests.

CREATE TABLE users (
    id         UUID         NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    name       VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE categories (
    id   UUID         NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY (id),
    CONSTRAINT categories_name_key UNIQUE (name)
);

CREATE TABLE tags (
    id   UUID         NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_name_key UNIQUE (name)
);

CREATE TABLE posts (
    id           UUID         NOT NULL,
    title        VARCHAR(255) NOT NULL,
    content      TEXT         NOT NULL,
    status       VARCHAR(255) NOT NULL,
    reading_time INTEGER      NOT NULL,
    author_id    UUID         NOT NULL,
    category_id  UUID         NOT NULL,
    created_at   TIMESTAMP(6) NOT NULL,
    updated_at   TIMESTAMP(6) NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_status_check CHECK (status IN ('DRAFT', 'PUBLISHED')),
    CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES users (id),
    CONSTRAINT posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE post_tags (
    post_id UUID NOT NULL,
    tag_id  UUID NOT NULL,
    CONSTRAINT post_tags_pkey PRIMARY KEY (post_id, tag_id),
    CONSTRAINT post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES posts (id),
    CONSTRAINT post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags (id)
);
