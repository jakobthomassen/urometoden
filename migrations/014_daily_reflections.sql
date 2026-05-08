CREATE TABLE IF NOT EXISTS daily_prompts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_date TEXT    NOT NULL UNIQUE,           -- YYYY-MM-DD
  body        TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON daily_prompts(prompt_date DESC);

CREATE TABLE IF NOT EXISTS user_daily_reflections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_date TEXT    NOT NULL,
  body        TEXT    NOT NULL DEFAULT '',
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000),
  UNIQUE(user_id, prompt_date)
);

CREATE INDEX IF NOT EXISTS idx_user_daily_ref_user ON user_daily_reflections(user_id, prompt_date DESC);
