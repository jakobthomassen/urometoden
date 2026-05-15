CREATE TABLE IF NOT EXISTS users (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  email                 TEXT    NOT NULL UNIQUE,
  name                  TEXT,
  display_name          TEXT,
  is_admin              INTEGER NOT NULL DEFAULT 0,
  membership            TEXT    NOT NULL DEFAULT 'none',
  membership_expires_at INTEGER,
  has_used_trial        INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL
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

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS password_resets (
  token      TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used_at    INTEGER
);

CREATE TABLE IF NOT EXISTS content_items (
  id       TEXT PRIMARY KEY,
  type     TEXT NOT NULL CHECK(type IN ('audio','video','case','reflect')),
  title    TEXT NOT NULL,
  meta     TEXT,
  r2_key   TEXT,
  abstract TEXT,
  body     TEXT,
  prompt   TEXT
);

CREATE TABLE IF NOT EXISTS week_content (
  week_id    INTEGER NOT NULL,
  content_id TEXT    NOT NULL REFERENCES content_items(id),
  position   INTEGER NOT NULL,
  meta       TEXT,
  PRIMARY KEY (week_id, content_id)
);

CREATE TABLE IF NOT EXISTS tips (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  body      TEXT    NOT NULL,
  used_at   INTEGER,
  used_date TEXT
);

CREATE TABLE IF NOT EXISTS daily_prompts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_date TEXT    UNIQUE,
  body        TEXT    NOT NULL,
  used_at     INTEGER,
  used_date   TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

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

CREATE TABLE IF NOT EXISTS section_cards (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  section     TEXT    NOT NULL CHECK(section IN ('fordypning', 'uroskolen')),
  icon        TEXT    NOT NULL DEFAULT 'info',
  title       TEXT    NOT NULL,
  description TEXT,
  link        TEXT,
  link_label  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_state (
  user_id               INTEGER NOT NULL PRIMARY KEY REFERENCES users(id),
  active_week           INTEGER NOT NULL DEFAULT 1,
  reflection_consent_at INTEGER
);

CREATE TABLE IF NOT EXISTS user_week_progress (
  user_id      INTEGER NOT NULL REFERENCES users(id),
  week_id      INTEGER NOT NULL,
  started_at   INTEGER,
  completed_at INTEGER,
  PRIMARY KEY (user_id, week_id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id          INTEGER NOT NULL REFERENCES users(id),
  item_id          TEXT    NOT NULL REFERENCES content_items(id),
  completed_at     INTEGER,
  position_seconds REAL    NOT NULL DEFAULT 0,
  listen_seconds   REAL    NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_reflections (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  item_id    TEXT    NOT NULL REFERENCES content_items(id),
  body       TEXT    NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS user_daily_reflections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_date TEXT    NOT NULL,
  body        TEXT    NOT NULL DEFAULT '',
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  UNIQUE(user_id, prompt_date)
);

CREATE TABLE IF NOT EXISTS user_login_days (
  user_id INTEGER NOT NULL REFERENCES users(id),
  day     TEXT    NOT NULL,
  PRIMARY KEY (user_id, day)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_name         ON users(name);
CREATE INDEX IF NOT EXISTS idx_identities_uid     ON identities(user_id);
CREATE INDEX IF NOT EXISTS idx_week_content_wid   ON week_content(week_id);
CREATE INDEX IF NOT EXISTS idx_tips_used_at       ON tips(used_at);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON daily_prompts(prompt_date);
