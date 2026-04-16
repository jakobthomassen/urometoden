-- Migration 001: replace single-provider users table with users + identities
-- Safe to run when re-authorization is acceptable (existing sessions will be invalidated)

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,
  name         TEXT,
  display_name TEXT,
  is_admin     INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL
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
