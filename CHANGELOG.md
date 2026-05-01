# Changelog

## 01.05.2026

Replaced the "Uro" script-font logo with an inline SVG wordmark in both the user-facing TopNav and the admin header. Background rect removed; paths use `currentColor` so the mark adapts to light and dark mode automatically. Extracted into a shared `UroLogo` component. Admin header alignment changed from `align-items: baseline` to `center` to accommodate the SVG.

Security audit and hardening pass:

- Deleted unauthenticated legacy `/audio/[filename].js` route (no auth, wrong Range handling, public cache, reflected filename in 404). The only caller (`weeks.js`) was updated to use the authenticated `/api/audio/` endpoint.
- Added `Cache-Control: private, no-store` to `/api/auth/me`.
- Server-side self-demotion guard on admin user PATCH — API now rejects `is_admin` changes targeting the caller's own account.
- Session table cleanup on login — expired and revoked rows for the signing-in user are purged before the new session row is inserted.
- Replaced dynamic column interpolation in content PATCH with a static `FIELD_QUERIES` map; no column names are string-interpolated into SQL.
- `weekId` URL parameter now validated as a finite integer in range 1–8 before the DB query runs.
- `user_hint` localStorage cache stripped of `id` and `email`; stores only the fields needed for the optimistic render.
- `SELECT *` replaced with explicit column lists across `me.js`, `content.js`, `admin/content/index.js`, and `admin/users/[id].js`. Hard `LIMIT 500` cap added to all unbounded content queries.

---

## 29.04.2026

Implemented session revocation — login now creates a row in a new `sessions` table (migration 005) containing a UUID `sid`, expiry, and `revoked` flag. The `sid` is embedded in the JWT. `getSession` rejects any token whose `sid` is missing or marked revoked. Logout sets `revoked = 1` in the DB before clearing the cookie, so captured tokens are immediately dead. `me.js` now routes through `getSession` instead of raw `verifyJwt`.

Closed audio path traversal — R2 key validation now includes an extension allowlist (`.mp3 .m4a .aac .ogg .wav .flac`), in addition to the existing `..` and leading-slash checks.

Added DOMPurify to the admin markdown renderer — `marked.parse()` output is sanitized before `dangerouslySetInnerHTML` in the Prosjekt tab.

---

## 28.04.2026

Implemented admin Innhold tab — full content management with type selector (2×2 grid), per-type form, R2 file picker showing used/available files, week assignment with position ordering, and create/edit/delete. Admin form places file picker first for audio/video; selecting a file auto-fetches duration and formats it as "Xm Ys". Content list shows column headers, type badges, abstract preview, duration, and an amber warning on items missing a required file.

Improved admin Daglige tips tab — callout explaining the rotation system, days-of-coverage count, "Neste" badge on the first queued tip, renamed section to "I kø — vises fremover", tips sorted newest-first in the sent archive.

Introduced AudioModal — clicking an audio card in Bibliotek opens a popup showing title, short descriptor, duration, week assignments, and optional description. "Lytt" button in the modal launches the fullscreen player.

Updated content cards — now show abstract (mini descriptor), duration, and week chips below the title.

Added volume slider to fullscreen player, synced with the mini player.

Built `/api/audio/[[filename]]` — authenticated R2 streaming endpoint with proper HTTP Range header parsing (converts `bytes=N-M` to `{ offset, length }` R2 range objects). Catch-all route handles keys with path separators.

Content API (`/api/content`) now joins `week_content` and returns a `weeks` array per item. Both content endpoints changed to `Cache-Control: private, no-store`.

Admin logo is now a link back to the main app.

---

## 23.04.2026

Created Help page with two tabs — Hjelp og støtte (FAQ + contact) and Personvern (full Norwegian privacy policy covering GDPR rights, data processors, cookie policy, and contact). Accessible via the avatar dropdown.

Wired "Personvern" and "Hjelp og støtte" in the avatar dropdown — both navigate to the correct tab. Profil and Innstillinger remain disabled pending display name and settings features.

Performance: added DB indexes on `users(email)`, `users(name)`, `week_content(week_id)`, `tips(used_at)`, and `identities(user_id)` — migration 004. Eliminates full table scans on admin search, week content joins, and tip ordering.

Dropped `SELECT *` TODO item — all content_items columns are consumed by the frontend (body/abstract/prompt by modals, r2_key reserved for audio).

---

## 21.04.2026

Implemented daily hint system ("Dagens tanke") — a single tip is picked randomly at system level and shown to all users on the same day. Tips are DB-backed (`tips` table) with a 7-day grace period preventing recently used tips from re-entering rotation immediately on reset. Admin CRUD under `/api/admin/tips`. Frontend caches today's tip in localStorage keyed by date.

---

## 20.04.2026

Implemented membership gating — non-members see a different dashboard (hero card, benefits grid, trial CTA) and cannot access Reisen, Bibliotek, or any week content. Nav tabs and sidebar items show lock state.

Security: added session check to `/api/content` and `/api/weeks/[weekId]/content` — both were publicly accessible without auth.

Security: added input validation to admin PATCH endpoint — `id` NaN check, `is_admin` 0/1, `membership` enum, `membership_expires_at` null or positive integer.

Security: fixed OAuth callback to check `tokenRes.ok`, `userRes.ok`, and `googleUser.email` before proceeding — previously threw on any Google API failure.

Performance: admin user list is now paginated server-side (`LIMIT`/`OFFSET`). API returns `{ results, total, memberCount, trialCount }`. Stats row counts are now accurate regardless of page.

Performance: added `Cache-Control: public, max-age=3600` to content API endpoints.

Performance: `App.jsx` now renders immediately from a `user_hint` localStorage cache — eliminates blank-screen flash on page load. Hint is updated after each `me.js` response and cleared on logout.

Changed "Under utvikling" banner on login page from green to amber to match the daily hint style.

Updated TODO security and performance sections — added findings from full codebase sweep: missing DB indexes, unbounded admin query, admin PATCH validation gap, audio path traversal, OAuth callback error handling, markdown XSS note, GDPR Article 9 flag.

---

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
