CREATE TABLE discussion_rate_secret (id INTEGER PRIMARY KEY CHECK (id = 1), secret TEXT NOT NULL);
INSERT INTO discussion_rate_secret (id, secret) VALUES (1, lower(hex(randomblob(32))));
CREATE TABLE discussion_rate_events (id TEXT PRIMARY KEY, action TEXT NOT NULL, ip_hash TEXT NOT NULL, created_ms INTEGER NOT NULL);
CREATE INDEX discussion_rate_window ON discussion_rate_events(action, ip_hash, created_ms);
CREATE INDEX discussion_rate_expiry ON discussion_rate_events(created_ms);
