-- Indexes for the queries the API runs. Foreign keys aren't indexed automatically in Postgres.

-- Published feed, newest first (GET /posts)
CREATE INDEX IF NOT EXISTS posts_status_created_at_idx ON posts (status, created_at);

-- Feed filtered by category, and the "category still has posts?" check before deleting one
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON posts (category_id);

-- An author's drafts (GET /posts/drafts)
CREATE INDEX IF NOT EXISTS posts_author_id_status_idx ON posts (author_id, status);

-- Feed filtered by tag, and the "tag still in use?" check (the primary key covers post_id lookups)
CREATE INDEX IF NOT EXISTS post_tags_tag_id_idx ON post_tags (tag_id);
