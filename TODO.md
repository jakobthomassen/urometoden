# TODO

## User authentication — Google Sign-In

Protect all app content behind Google Sign-In. Unauthenticated users see only the onboarding/landing page.

**Google OAuth client:**
- Update the existing client's redirect URI to `https://yourdomain.com/api/auth/callback`
- No need to delete and recreate

**DB schema addition:**
```sql
CREATE TABLE users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id  TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL,
  name       TEXT,
  is_admin   INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
```

**Session:** JWT in `httpOnly` cookie, signed with `AUTH_SECRET` env var (set in Cloudflare Pages → Settings → Environment variables).

**Pages Functions:**
- `GET /api/auth/google` — redirects to Google OAuth URL
- `GET /api/auth/callback` — exchanges code, upserts user in D1, signs JWT, sets cookie, redirects to `/`
- `GET /api/auth/me` — reads cookie, returns `{ id, email, name, is_admin }` or 401
- `POST /api/auth/logout` — clears cookie

**Frontend:**
- `App.jsx` — call `/api/auth/me` on load; if 401 → show `OnboardingPage`, else show current app
- New `OnboardingPage.jsx` — landing page with "Fortsett med Google" button
- Pass user object down to components that need it (e.g. TopNav for name/avatar)

**Admin access:**
- `is_admin` flag in `users` table (0/1)
- Set manually: `wrangler d1 execute urometoden-db --remote --command "UPDATE users SET is_admin = 1 WHERE email = 'you@example.com'"`
- Pages Functions serving `/admin*` check `is_admin` from JWT before responding

**Replaces:** the Cloudflare Access approach for admin (see below) — admin is now gated by `is_admin` flag + same Google Sign-In flow, no separate Zero Trust setup needed.

---

## Admin page

Simple internal dashboard for content management. Gated by `is_admin` flag (see auth above).

**Initial features:**
- Add / list / delete tips (Dagens tanke)
- Possibly: add content items

**Implement together with auth.**

---

## Dagens tanke — rotating tips system

Replace the hardcoded `TIPS` array in `DashboardPage.jsx` with a DB-backed rotation system.

**DB schema addition:**
```sql
CREATE TABLE tips (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  body    TEXT NOT NULL,
  used_at INTEGER  -- NULL = unused; epoch ms when last shown
);
```

**API:**
- `GET /api/tip` — picks random unused tip, marks it used, returns `{ id, body }`. If all used, resets all (set used_at = NULL) then picks one.
- Admin endpoints (add, list, delete) — served under `/admin*`, requires `is_admin`.

**Frontend:**
- On load, check localStorage: `{ tipId, body, date }`.
- If `date === today` → show cached tip.
- Else → fetch `/api/tip`, cache result with today's date.

**Benched until:** auth + admin page are implemented.
