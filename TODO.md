# TODO

### Security hardening

**Rate limiting on auth endpoints** *(medium — Cloudflare dashboard)*
`/api/auth/google` and `/api/auth/callback` are open to abuse. Configure via Cloudflare dashboard → Security → Rate Limiting. No code change needed.

**GDPR Article 9 + DPIA required** *(compliance — must resolve before launch)*
Reflection text is special-category data under Article 9 (health/mental health). This triggers a mandatory Data Protection Impact Assessment (DPIA) under Article 35 before any live processing — systematic collection of health data by definition meets the threshold. The DPIA must document: the nature and purpose of processing, necessity and proportionality, risks to data subjects, and mitigating measures. Without a completed DPIA, the service cannot lawfully process reflections.

Explicit consent (Article 9(2)(a)) is already gated in the app. Still required before launch:
- Complete and document the DPIA — assign to whoever handles legal/DPO
- Draft privacy policy covering the Article 9 processing (see Legal section below)
- Verify there is no obligation to appoint a DPO (likely not required for a small operator, but confirm)
- Datatilsynet (_no.datatilsynet.no_) does not require pre-registration, but the DPIA must be available on request

---

### Mobile — sign-in button stuck in loading state

If the user opens the Google sign-in sheet and dismisses it without completing auth, the login button stays in an infinite loading state. `promptAsync()` resolves with `type: 'dismiss'` but the current `handleGooglePress` sets `loading = true` and only clears it on `response.type === 'error'`. Fix: reset `loading` to `false` when `response?.type === 'dismiss'` (or any non-success type) in the `useEffect` that watches `response`.

---

### Env var naming cleanup

Before handoff to client, rename env vars to consistent conventions:
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` (currently named after web's `GOOGLE_CLIENT_ID`)
- Align Cloudflare worker secrets and `.env.local` keys so naming reflects purpose, not history

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
4. Migrate all data from the orphaned `user_id` — `user_progress`, `user_reflections`, `user_week_progress`, `user_state`, `user_login_days`, `sessions`
5. Delete the orphaned `users` row

Merge conflicts need a defined strategy — e.g. if both accounts have progress on week 1, keep the most recent `completed_at`. Define this before implementing. Surface "Connected accounts" in the profile page.

---

### User progress

Migration 006 complete. Progress, reflections, week state, and login streak are all DB-backed. See CHANGELOG for full details.

**Optional content items** *(post-launch polish)*
Add an `optional` boolean column to `content_items`. Optional items (e.g. written reflections) are excluded from the week-completion check — a week is considered done when all non-optional items have `completed_at` set. The admin Innhold form should expose a toggle for this flag. Content cards for optional items should carry a visual indicator (e.g. a muted "Valgfri" label) so users know they can skip without blocking progress.

**Account deletion cascade** *(GDPR — must update before launch)*
The `DELETE FROM users` cascade must also cover the new tables added in migration 006: `user_progress`, `user_reflections`, `user_week_progress`, `user_state`, `user_login_days`. Add these to the account deletion flow once it is implemented.

**Stat grid — 4th card** *(placeholder)*
The 4th stat card currently shows "—" and "Kommer snart". Define what it tracks before launch.

---

### Admin dashboard — remaining

First draft is live. Remaining:

- **Access rules enforcement**: which weeks/content are free vs. member-only? What does a non-member see — locked cards, a paywall prompt?
- **Dev unlock button**: now hidden from non-admin users ✓ — but still shown to admins outside of production. Remove or gate behind an env flag before launch.

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
Users must be able to delete their account and all associated data. Hard-delete rows across `users`, `identities`, `sessions`, `user_progress`, `user_reflections`, `user_week_progress`, `user_state`, `user_login_days`. Add a delete account flow in the profile/settings page with a confirmation step.

**Data export (Article 20 — right to portability)**
Implement `GET /api/account/export` — returns a JSON file of all data tied to the user.

**Consent**

- Cookie consent: the session cookie is strictly necessary (no banner required), but document this in the privacy policy.
- Article 9 consent gate for reflections is implemented (migration 008, `reflection_consent_at`). The DPIA must be completed before launch — see Security hardening section above.

**Privacy policy page**
Must cover: what data is collected, why, retention period, third parties (Google OAuth, Cloudflare), and user rights. Write in Norwegian.

**Terms of service page**
Acceptable use, service availability, subscription terms.

**Data processor agreement**
Cloudflare and Google act as data processors. Document in privacy policy.

**Data residency**
D1 data may be stored outside the EEA. Check Cloudflare's D1 location options — prefer EEA if available.

