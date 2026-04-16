# TODO

### Auth schema migration — multi-provider ready

Current `users` table has `google_id NOT NULL` — blocks any non-Google auth provider. Migrate before adding Apple or email/password auth.

**Target schema:**
```sql
CREATE TABLE users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT    NOT NULL UNIQUE,
  name         TEXT,
  display_name TEXT,
  is_admin     INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL
);

CREATE TABLE identities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider    TEXT    NOT NULL, -- 'google' | 'apple' | 'email'
  provider_id TEXT    NOT NULL, -- google sub, apple sub, or email address
  credential  TEXT,             -- NULL for OAuth, password hash for email/pw
  created_at  INTEGER NOT NULL,
  UNIQUE(provider, provider_id)
);
```

**Migration steps:**
1. Create `identities` table
2. Backfill: insert one row per existing user (`provider = 'google'`, `provider_id = google_id`)
3. Drop `google_id` column from `users`
4. Update auth functions to look up `identities` instead of `users.google_id`

**Notes:**
- Apple only provides name and email on the first sign-in — must persist on first auth.
- Email+password requires PBKDF2 hashing (Web Crypto), email verification, and password reset — scope separately from OAuth.

**Account linking and merge**
A user may sign up on web with Google, then sign up on the app with Apple — creating two separate `users` rows. When they link accounts, the two must be merged:

1. User initiates "Connect Google" while logged in with Apple (or vice versa)
2. OAuth completes — look up the email in `users` to find the existing account
3. Reassign the incoming `identities` row to the existing `user_id`
4. Migrate all data from the orphaned `user_id` — `user_progress`, `user_reflections`, `sessions`
5. Delete the orphaned `users` row

Merge conflicts need a defined strategy — e.g. if both accounts have progress on week 1, keep the most recent `completed_at`. Define this before implementing.

Apple relay emails (`privaterelay.appleid.com`) cannot be matched to a Google account automatically — auto-linking is not reliable. Manual linking from account settings is the safe path. Surface "Connected accounts" in the profile page.

**Coordinate with the app team before they implement Apple Sign-In** — retrofitting the `identities` schema and merge flow after launch is significantly harder.

---

### Security hardening

**Unprotected API endpoints**
`/api/content` and `/api/weeks/[weekId]/content` have no auth check — content is publicly readable via direct API call even though the UI is gated. Add JWT verification to all API functions, either inline or via a shared middleware helper in `functions/lib/`.

**Stale `is_admin` in JWT**
Promoting or demoting an admin has no effect until their 30-day token expires. Options: shorten JWT expiry (e.g. 1 hour + refresh token), or do a DB lookup on `is_admin` for admin-only endpoints rather than trusting the JWT claim.

**Rate limiting on auth endpoints**
`/api/auth/google` and `/api/auth/callback` are open to abuse. No code change needed — configure via Cloudflare dashboard → Security → Rate Limiting.

**Session revocation**
No way to invalidate a specific session (compromised account, logout-all-devices). Requires a `sessions` table in D1 checked on each `/api/auth/me` request.

```sql
CREATE TABLE sessions (
  id         TEXT    PRIMARY KEY,  -- random UUID
  user_id    INTEGER NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked    INTEGER NOT NULL DEFAULT 0
);
```

Store session ID in the JWT, check it against the table on each request. Revoke by setting `revoked = 1`.

---

### Performance

**`/api/auth/me` blocks first render**
Every page load waits for a round trip before anything renders. Store a non-authoritative user hint in localStorage on sign-in. On load, render immediately from the hint while the `/api/auth/me` call confirms. If the call returns 401, clear the hint and show `OnboardingPage`.

**No cache headers on content API**
Week content and library items are static. Add `Cache-Control: public, max-age=3600` to `/api/content` and `/api/weeks/[weekId]/content` responses so Cloudflare caches them at the edge. Invalidate on content changes.

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
  user_id     INTEGER NOT NULL REFERENCES users(id),
  week_id     INTEGER NOT NULL,
  item_id     TEXT    NOT NULL REFERENCES content_items(id),
  completed_at INTEGER,          -- NULL = started but not complete
  listen_seconds INTEGER,        -- for audio items
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

### Admin dashboard

Internal page at `/admin`, gated by `is_admin` flag in JWT.

**Features:**
- Manage tips (Dagens tanke): add, list, delete
- Manage content items: add, edit, delete
- User list: view users, toggle `is_admin`, activate/revoke membership
- Membership controls: "Activate 7-day trial", "Activate 1-month membership" (see membership section)

**Implement together with:** Dagens tanke rotation and membership system.

---

### Dagens tanke — rotating tips

Replace hardcoded `TIPS` array in `DashboardPage.jsx` with a DB-backed rotation.

**Schema addition:**
```sql
CREATE TABLE tips (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  body    TEXT NOT NULL,
  used_at INTEGER  -- NULL = unused; epoch ms when last shown
);
```

**API:**
- `GET /api/tip` — picks random unused tip, marks it used. Resets all when exhausted.
- Admin CRUD under `/api/admin/tips` — gated by `is_admin`.

**Frontend:** cache today's tip in localStorage `{ tipId, body, date }`. Fetch new if date ≠ today.

**Benched until:** admin dashboard is built.

---

### Membership & access control

Simulate membership tiers with admin-controlled flags. No payment integration yet.

**Schema addition:**
```sql
ALTER TABLE users ADD COLUMN membership TEXT DEFAULT 'none';
-- values: 'none' | 'trial' | 'member'
ALTER TABLE users ADD COLUMN membership_expires_at INTEGER;
```

**Admin controls (in dashboard):**
- "Activate 7-day trial" → sets `membership = 'trial'`, `expires_at = now + 7 days`
- "Activate 1-month membership" → sets `membership = 'member'`, `expires_at = now + 30 days`
- Revoke: sets `membership = 'none'`

**Access rules (to define):**
- Which weeks/content are free vs. member-only?
- What does a non-member see — locked cards, a paywall prompt?

**Dev unlock button:** hide for non-admin users. Bundle this change with the admin dashboard work.

---

### User account — display name

Allow users to set a custom display name (separate from their Google name).

- Add `display_name TEXT` column to `users`
- Profile settings page or inline edit in the avatar dropdown
- TopNav and other components prefer `display_name` over `name` when set

---

### Avatar dropdown — full menu

Currently: Profil, Innstillinger, Personvern, Hjelp og støtte are disabled placeholders.

Each needs a destination:
- **Profil** → display name edit, account info
- **Innstillinger** → theme (already in TopNav), notification preferences (future)
- **Personvern** → link to privacy policy page
- **Hjelp og støtte** → link to help page

---

### Legal & compliance (GDPR / Norwegian law)

Norway follows GDPR via the Personal Data Act (*Personopplysningsloven*). The app stores name, email, Google ID, progress, and reflection text — all personal data under GDPR.

**Account deletion (Article 17 — right to erasure)**
Users must be able to delete their account and all associated data. This means hard-deleting rows across `users`, `user_progress`, `user_reflections`, and `sessions`. Add a delete account flow in the profile/settings page with a confirmation step.

**Data export (Article 20 — right to portability)**
Users can request a copy of their stored data in a machine-readable format. Implement a `GET /api/account/export` endpoint that returns a JSON file of all data tied to the user.

**Consent**
- Cookie consent: the session cookie is strictly necessary (no banner required), but document this in the privacy policy.
- Reflection text is sensitive (anxiety-related) and likely qualifies as **special category data under GDPR Article 9** (data concerning health/mental health). This carries stricter requirements than ordinary personal data — explicit consent, a documented legal basis, and stronger security measures. Flag this to whoever drafts the privacy policy before launch.

**Privacy policy page**
Must cover: what data is collected, why, how long it is kept, third parties (Google OAuth, Cloudflare), and user rights (access, correction, deletion, portability). Should be written in Norwegian.

**Terms of service page**
Standard ToS covering acceptable use, service availability, and subscription terms.

**Data processor agreement**
Cloudflare and Google act as data processors. Cloudflare's DPA is available in their dashboard. Google's is covered under their OAuth terms. Document these in the privacy policy.

**Data residency**
D1 data may be stored outside the EEA by default. Check Cloudflare's current D1 data location options — if EEA-only storage becomes available, prefer it.

Linked from onboarding page footer and avatar dropdown.

---

### Help page

Static or lightly dynamic. Content TBD.
