CREATE TABLE IF NOT EXISTS users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  email                 TEXT    NOT NULL UNIQUE,
  name                  TEXT,
  display_name          TEXT,
  is_admin              INTEGER NOT NULL DEFAULT 0,
  membership            TEXT    NOT NULL DEFAULT 'none',
  membership_expires_at INTEGER,
  created_at            INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tips (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  body      TEXT    NOT NULL,
  used_at   INTEGER,
  used_date TEXT
);

CREATE TABLE IF NOT EXISTS identities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT    NOT NULL,
  provider_id TEXT    NOT NULL,
  credential  TEXT,
  created_at  INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);

CREATE TABLE IF NOT EXISTS content_items (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK(type IN ('audio','video','case','reflect')),
  title      TEXT NOT NULL,
  meta       TEXT,
  r2_key     TEXT,
  abstract   TEXT,
  body       TEXT,
  prompt     TEXT
);

CREATE TABLE IF NOT EXISTS week_content (
  week_id    INTEGER NOT NULL,
  content_id TEXT    NOT NULL,
  position   INTEGER NOT NULL,
  meta       TEXT,                      -- overrides content_items.meta when set
  PRIMARY KEY (week_id, content_id),
  FOREIGN KEY (content_id) REFERENCES content_items(id)
);
