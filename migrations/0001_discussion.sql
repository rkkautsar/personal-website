CREATE TABLE comments (
  id TEXT PRIMARY KEY,
  post_slug TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  delete_token_hash TEXT NOT NULL
);
CREATE INDEX comments_post_created ON comments(post_slug, created_at, id);
CREATE TABLE likes (
  post_slug TEXT NOT NULL,
  voter_hash TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count BETWEEN 0 AND 10),
  PRIMARY KEY (post_slug, voter_hash)
);
