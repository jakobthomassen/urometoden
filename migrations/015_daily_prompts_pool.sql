-- Make prompt_date optional so prompts can live in a pool (no date)
-- or override a specific calendar date.
-- Add pool rotation columns (used_at, used_date) matching the tips pattern.
CREATE TABLE IF NOT EXISTS daily_prompts_v2 (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_date TEXT    UNIQUE,               -- NULL = pool prompt; YYYY-MM-DD = date override
  body        TEXT    NOT NULL,
  used_at     INTEGER,                      -- pool rotation: unix ms when last picked
  used_date   TEXT,                         -- pool rotation: YYYY-MM-DD date last used for
  created_at  INTEGER NOT NULL DEFAULT (unixepoch('now') * 1000)
);

INSERT INTO daily_prompts_v2 (id, prompt_date, body, created_at)
  SELECT id, prompt_date, body, created_at FROM daily_prompts;

DROP TABLE daily_prompts;
ALTER TABLE daily_prompts_v2 RENAME TO daily_prompts;

CREATE INDEX IF NOT EXISTS idx_daily_prompts_date ON daily_prompts(prompt_date);
