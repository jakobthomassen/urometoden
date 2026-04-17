-- Migration 003: tips table for rotating daily hints
CREATE TABLE tips (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  body      TEXT    NOT NULL,
  used_at   INTEGER,           -- NULL = unused; epoch ms when last shown
  used_date TEXT               -- 'YYYY-MM-DD' UTC; ensures same tip is served all day
);
