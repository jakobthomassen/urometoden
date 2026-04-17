# TODO

### Security hardening

**Unprotected API endpoints**
`/api/content` and `/api/weeks/[weekId]/content` have no auth check — content is publicly readable via direct API call even though the UI is gated. Add JWT verification to all API functions using the shared `functions/lib/auth.js` helper.

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

- **Dagens tanke** tab: add, list, delete tips (see below)
- **Innhold** tab: add, edit, delete content items and week assignments
- **Access rules enforcement**: which weeks/content are free vs. member-only? What does a non-member see — locked cards, a paywall prompt?
- **Dev unlock button**: hide for non-admin users

---

### Dagens tanke — rotating tips

Replace hardcoded `TIPS` array in `DashboardPage.jsx` with a DB-backed rotation.

**Schema addition (draft):**

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

### Avatar dropdown — full menu

Currently: Profil, Innstillinger, Personvern, Hjelp og støtte are disabled placeholders.

Each needs a destination:

- **Profil** → display name edit, account info
- **Innstillinger** → theme (already in TopNav), notification preferences (future)
- **Personvern** → link to privacy policy page
- **Hjelp og støtte** → link to help page

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

---

### Help page

Static or lightly dynamic. Content TBD.
