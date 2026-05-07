-- Track whether a user has ever been granted a trial, so admins can see repeat requests.
-- Existing users default to 0; set to 1 whenever membership = 'trial' is assigned.
ALTER TABLE users ADD COLUMN has_used_trial INTEGER NOT NULL DEFAULT 0;
