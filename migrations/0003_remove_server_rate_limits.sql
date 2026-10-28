-- Rate limiting is enforced in the browser; remove the unused server-side tables.
DROP TABLE discussion_rate_events;
DROP TABLE discussion_rate_secret;
