-- Migration 004: indexes for search, ordering, and FK traversal
CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name       ON users(name);
CREATE INDEX IF NOT EXISTS idx_week_content_wid ON week_content(week_id);
CREATE INDEX IF NOT EXISTS idx_tips_used_at     ON tips(used_at);
CREATE INDEX IF NOT EXISTS idx_identities_uid   ON identities(user_id);
