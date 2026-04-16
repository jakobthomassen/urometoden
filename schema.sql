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
