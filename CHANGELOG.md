# Changelog

## 16.04.2026

Implemented Google Identity Services authentication flow
- Users sign in with Google OAuth. Session issued as a signed JWT in an httpOnly cookie (30-day expiry). User record upserted into D1 on each sign-in.
- Admin access controlled by `is_admin` flag in the `users` table, set manually via `wrangler d1 execute`.

Created onboarding/landing page with Google sign-in button and development disclaimer.

Gated all app content behind user authentication.

Updated profile dropdown to show real name, email, and working logout.

Set up D1 database with `content_items`, `week_content`, and `users` tables.

Moved weekly content from static frontend data to D1 — fetched via Pages Functions API.

Added week unlock logic — weeks unlock 5 calendar days after start, at 10:00 Europe/Oslo.

Added developer override button to unlock next week instantly (visible when all content in current week is complete).

Built 8-week journey overview page (Reisen) with unlock status and countdown hints.

Built dashboard home page with time-based greeting and daily tip.

Added sidebar navigation with week list and library filters.

Built fullscreen audio player with decorative wave canvas animation.

Added global keyboard shortcuts — spacebar to pause, arrow keys to skip ±15 seconds.

Added reflection card modal with text input saved to localStorage.

Added case card read-only modal.
