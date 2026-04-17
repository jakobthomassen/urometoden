# Changelog

## 17.04.2026

Improved admin dashboard layout — content now centered with max-width on large displays.

Added pagination to user list with configurable per-page (10/25/50), page controls, and count display. Resets to page 1 on search or per-page change.

Prosjekt tab displays CHANGELOG and TODO side-by-side as independently scrollable panels — headers pinned, bodies scroll.

Added "Prosjekt" tab to admin dashboard serving CHANGELOG.md and TODO.md as collapsible rendered markdown — dev only, to be removed before prod.

Fixed membership badge in TopNav — shows live trial countdown (days/hours), green "Medlem" for members, grey "Ikke medlem" otherwise. Clicking prompts billing page notice.

Made "Logg ut" in profile dropdown functional, red, and moved to bottom. Renamed "Tilbakestill pop-ups" to "Nullstill kursdata" — now also clears week progress and reflection text from localStorage. Removed Uroskolen tab from nav.

---

## 16.04.2026

Migrated `users` table to multi-provider auth schema — replaced `google_id` column with a separate `identities` table.
- Supports Google, Apple, and email/password without schema changes per provider.
- `callback.js` now upserts into `users` by email and writes a linked row to `identities`.

Built admin dashboard at `/admin`, gated by `is_admin` flag.
- User list with name search, membership status badges, and admin toggle.
- Membership controls per user: 7-day trial, 1-month membership, revoke access.
- Placeholder tabs for daily tips and content management.

Added membership columns to `users` table (`membership`, `membership_expires_at`).

Added dynamic membership badge to TopNav — counts down days/hours remaining for trial, shows "Medlem" in green for members, "Ikke medlem" in grey otherwise. Clicking prompts a billing page notice.

`/api/auth/me` now reads live from D1 instead of trusting JWT claims — membership and admin status take effect immediately without requiring re-login.

Implemented Google Identity Services authentication flow.
- Users sign in with Google OAuth. Session issued as a signed JWT in an httpOnly cookie (30-day expiry).
- Admin access controlled by `is_admin` flag in the `users` table.

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
