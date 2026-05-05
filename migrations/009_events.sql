CREATE TABLE IF NOT EXISTS events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  event_date   INTEGER NOT NULL,
  type         TEXT    NOT NULL CHECK(type IN ('online', 'fysisk')),
  location     TEXT,
  link         TEXT,
  description  TEXT,
  reveal_at    INTEGER,
  cancelled    INTEGER NOT NULL DEFAULT 0,
  cancelled_at INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
