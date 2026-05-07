-- Audit log table. No FK constraints on actor_id/target_id intentionally —
-- logs must survive user deletion and event deletion.
CREATE TABLE IF NOT EXISTS logs (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  event      TEXT    NOT NULL,  -- dot-namespaced key, e.g. 'user.signup'
  tag        TEXT    NOT NULL,  -- category for filtering: bruker | tilgang | admin | arrangement
  actor_id   INTEGER,           -- user who performed the action; NULL = system
  target_id  INTEGER,           -- affected user ID; NULL if not applicable
  meta       TEXT,              -- JSON string for extra context (titles, emails, etc.)
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_tag        ON logs(tag);
CREATE INDEX IF NOT EXISTS idx_logs_event      ON logs(event);
