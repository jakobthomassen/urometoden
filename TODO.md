# TODO

### Security hardening

**Rate limiting on auth endpoints** *(medium)*
`/api/auth/google` and `/api/auth/callback` are open to abuse. No code change needed — configure via Cloudflare dashboard → Security → Rate Limiting.

**Session revocation** *(done — migration 005)*
`sessions` table in D1. Login creates a row; logout marks it `revoked = 1`. `getSession` rejects any token whose `sid` is revoked or missing from the table. "Logout all devices" can be implemented by revoking all rows for a `user_id`.

**Path traversal in audio endpoint** *(done — fully mitigated)*
Catch-all route joins the params array, blocks `..` and leading `/`, and validates the key against an audio extension allowlist (`.mp3 .m4a .aac .ogg .wav .flac`).

**XSS via unsanitized markdown** *(done)*
`AdminPage.jsx` now passes `marked.parse()` output through `DOMPurify.sanitize()` before rendering.

**Unauthenticated legacy audio route** *(critical)*
`frontend/functions/audio/[filename].js` (serving `/audio/*`) has no auth check — any unauthenticated request can stream R2 files. Also has incorrect Range handling (passes raw headers object to R2), `Cache-Control: public`, and reflects the filename in 404 responses. The authenticated replacement is `/api/audio/[[filename]].js`. Verify nothing still calls `/audio/` then delete the legacy file.

**`me.js` missing cache guard** *(medium)*
`/api/auth/me` returns user-specific data (membership, is_admin) with no `Cache-Control` header. Should add `Cache-Control: private, no-store` to prevent any edge caching.

**Admin API missing server-side self-demotion guard** *(medium)*
`/api/admin/users/[id].js` PATCH has no server-side check preventing an admin from revoking their own `is_admin`. The frontend blocks it, but the raw API does not. Add `if (payload.sub === params.id && 'is_admin' in data)` guard.

**Session table cleanup** *(medium)*
Expired and revoked `sessions` rows accumulate indefinitely. No cleanup mechanism exists. Options: delete expired rows on every login (low-cost), or a scheduled Cloudflare Cron Trigger running `DELETE FROM sessions WHERE expires_at < ?`.

**Dynamic column interpolation in content PATCH** *(low)*
`admin/content/[id].js` builds `SET col = ?` clauses by interpolating whitelisted column names directly into SQL. The EDITABLE array prevents injection today, but this pattern is fragile — a future typo or bad merge could expose it. Replace with explicit per-field prepared statements.

**`weekId` not validated as finite integer** *(low)*
`/api/weeks/[weekId]/content.js` uses `parseInt(params.weekId)` without checking for `NaN`. Should add `if (!Number.isFinite(weekId) || weekId < 1 || weekId > 8)` guard.

**`user_hint` localStorage caches sensitive fields** *(low)*
`App.jsx` stores `{ id, email, name, is_admin, membership }` in localStorage as a render hint. If XSS ever runs, that cache is readable. Consider storing only the non-sensitive display hint (name, membership tier) and re-fetching `is_admin` and `membership_expires_at` from the live response only.

**`SELECT *` in hot paths** *(low — performance)*
`me.js` and `admin/content/index.js` use `SELECT *`. Explicit column lists reduce bytes parsed per row and protect against accidentally exposing future columns.

**No pagination on content endpoints** *(low — performance)*
`/api/content` and `/api/admin/content` fetch all rows with no `LIMIT`. Fine at current scale, but should add pagination or at minimum a hard cap (`LIMIT 500`) before the library grows large.

**GDPR Article 9 — reflection text** *(compliance)*
Reflection text (personal emotional/mental-health data) likely qualifies as special-category data. Requires explicit consent and a documented legal basis before launch. Flag to whoever drafts the privacy policy.

---

### Multi-provider auth — Apple Sign-In & account linking

Schema is ready (`identities` table). Coordinate with the app team before they implement Apple Sign-In.

**Apple-specific notes:**

- Apple only provides name and email on the first sign-in — must persist on first auth.
- Apple relay emails (`privaterelay.appleid.com`) cannot be matched to a Google account automatically — auto-linking is unreliable. Use manual linking from account settings.

**Account linking and merge**
A user may sign up on web with Google, then sign up on the app with Apple — creating two separate `users` rows. When they link accounts, the two must be merged:

1. User initiates "Connect Google" while logged in with Apple (or vice versa)
2. OAuth completes — look up the email in `users` to find the existing account
3. Reassign the incoming `identities` row to the existing `user_id`
4. Migrate all data from the orphaned `user_id` — `user_progress`, `user_reflections`, `sessions`
5. Delete the orphaned `users` row

Merge conflicts need a defined strategy — e.g. if both accounts have progress on week 1, keep the most recent `completed_at`. Define this before implementing. Surface "Connected accounts" in the profile page.

---

### User progress — DB migration

Move all progress tracking from localStorage to D1. localStorage is per-device and lost on clear; DB-backed progress follows the user across devices.

**What needs migrating:**

- Week start timestamps (currently `week_progress` in localStorage)
- Completed item IDs per week
- Reflection text per item

**Revise the definition of "completed":**

- Currently: any click on a card marks it complete.
- Consider: explicit "Merk som fullført" button, minimum listening time for audio, or a combination.
- Decision needed before migration — the schema should reflect the final completion model.

**Schema additions (draft):**

```sql
CREATE TABLE user_progress (
  user_id        INTEGER NOT NULL REFERENCES users(id),
  week_id        INTEGER NOT NULL,
  item_id        TEXT    NOT NULL REFERENCES content_items(id),
  completed_at   INTEGER,
  listen_seconds INTEGER,
  PRIMARY KEY (user_id, week_id, item_id)
);

CREATE TABLE user_reflections (
  user_id    INTEGER NOT NULL REFERENCES users(id),
  item_id    TEXT    NOT NULL REFERENCES content_items(id),
  body       TEXT,
  updated_at INTEGER,
  PRIMARY KEY (user_id, item_id)
);
```

**Benched until:** completion model is decided.

---

### Admin dashboard — remaining

First draft is live. Remaining:

- **Access rules enforcement**: which weeks/content are free vs. member-only? What does a non-member see — locked cards, a paywall prompt?
- **Dev unlock button**: hide for non-admin users

---

### Membership & access control — access rules

Schema and admin controls are implemented. Still to define and enforce:

- Which weeks/content are free vs. member-only?
- What does a non-member or expired trial see — locked cards, a paywall prompt?
- Membership expiry enforcement on the frontend and API.

---

### User account — display name

Allow users to set a custom display name (separate from their Google name).

- `display_name` column already exists in `users` table
- Profile settings page or inline edit in the avatar dropdown
- TopNav and other components prefer `display_name` over `name` when set

---

### Avatar dropdown — remaining

Personvern and Hjelp og støtte are now wired. Still pending:

- **Profil** → display name edit (blocked on display name feature)
- **Innstillinger** → no settings to show yet beyond theme toggle; revisit when notification preferences or other settings are added

---

### Legal & compliance (GDPR / Norwegian law)

Norway follows GDPR via the Personal Data Act (_Personopplysningsloven_). The app stores name, email, Google ID, progress, and reflection text — all personal data under GDPR.

**Account deletion (Article 17 — right to erasure)**
Users must be able to delete their account and all associated data. Hard-delete rows across `users`, `identities`, `user_progress`, `user_reflections`, and `sessions`. Add a delete account flow in the profile/settings page with a confirmation step.

**Data export (Article 20 — right to portability)**
Implement `GET /api/account/export` — returns a JSON file of all data tied to the user.

**Consent**

- Cookie consent: the session cookie is strictly necessary (no banner required), but document this in the privacy policy.
- Reflection text likely qualifies as **special category data under GDPR Article 9** (health/mental health). Requires explicit consent, a documented legal basis, and stronger security measures. Flag to whoever drafts the privacy policy before launch.

**Privacy policy page**
Must cover: what data is collected, why, retention period, third parties (Google OAuth, Cloudflare), and user rights. Write in Norwegian.

**Terms of service page**
Acceptable use, service availability, subscription terms.

**Data processor agreement**
Cloudflare and Google act as data processors. Document in privacy policy.

**Data residency**
D1 data may be stored outside the EEA. Check Cloudflare's D1 location options — prefer EEA if available.

