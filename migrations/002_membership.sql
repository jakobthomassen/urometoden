-- Migration 002: add membership columns to users
ALTER TABLE users ADD COLUMN membership TEXT NOT NULL DEFAULT 'none';
ALTER TABLE users ADD COLUMN membership_expires_at INTEGER;
