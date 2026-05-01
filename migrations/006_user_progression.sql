CREATE TABLE user_progress (
  user_id          INTEGER NOT NULL REFERENCES users(id),
  item_id          TEXT    NOT NULL REFERENCES content_items(id),
  completed_at     INTEGER,
  position_seconds REAL    NOT NULL DEFAULT 0,
  listen_seconds   REAL    NOT NULL DEFAULT 0,
  updated_at       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE user_reflections (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  item_id    TEXT    NOT NULL REFERENCES content_items(id),
  body       TEXT    NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_id)
);

CREATE TABLE user_week_progress (
  user_id      INTEGER NOT NULL REFERENCES users(id),
  week_id      INTEGER NOT NULL,
  started_at   INTEGER,
  completed_at INTEGER,
  PRIMARY KEY (user_id, week_id)
);

CREATE TABLE user_state (
  user_id     INTEGER NOT NULL PRIMARY KEY REFERENCES users(id),
  active_week INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE user_login_days (
  user_id INTEGER NOT NULL REFERENCES users(id),
  day     TEXT    NOT NULL,
  PRIMARY KEY (user_id, day)
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user      ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_user   ON user_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_week_progress_user ON user_week_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_login_days_user    ON user_login_days(user_id);
