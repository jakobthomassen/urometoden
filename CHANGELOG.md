# Changelog

## 09.05.2026

**Daily rotating reflection questions**

Migration 014 adds two tables: `daily_prompts` (`id`, `prompt_date TEXT UNIQUE`, `body`, `created_at`) and `user_daily_reflections` (`id`, `user_id FK`, `prompt_date`, `body`, `updated_at`, UNIQUE on `user_id + prompt_date`). Prompts are global per day — one prompt per date, same for all users. Each user gets one editable reflection entry per day (upsert).

New API endpoints: `GET /api/daily-prompt` returns today's prompt and the authenticated user's existing reflection if any. `POST /api/me/daily-reflection` upserts today's reflection (idempotent — re-saving the same day updates the existing row). `GET /api/me/daily-reflections` returns full history with the prompt text joined.

Admin "Daglige spørsmål" tab added to the admin panel — mirrors the tips tab pattern. Date input (with minimum today) + textarea to create new prompts. Prompts listed in two sections: upcoming/today and past. Each row shows the date, prompt body, and inline edit/delete actions. Conflict (duplicate date) returns a user-facing error.

Web: `DailyReflectionCard` added to `MemberDashboard` on the dashboard page — visible to members only. Shows today's prompt, a textarea pre-filled with any existing reflection, and a save/update button with a completion badge when already filled. A "Vis tidligere refleksjoner →" text link opens a slide-up modal (bottom sheet, same pattern as event archive) listing all past entries with dates, prompt text, and reflection body. Card is absent when no prompt is configured for today.

Mobile home (`hjem.tsx`): `DailyReflectionCard` inline between the journey card and the daily tip. Uses `useFocusEffect` so it refreshes on every tab focus. Absent when no prompt exists for today. Mobile profile (`profil.tsx`): "Daglige refleksjoner" link card added to the reflections tab — opens `DailyReflectionArchiveModal` (page-sheet, same pattern as event archive) showing the full history with date headers and prompt context.

**Mobile theme overhaul**

`@expo-google-fonts/dm-sans` installed. Root `_layout.tsx` loads four weights (400/500/600/700) via `useFonts` and renders `null` until fonts are ready. New `components/ui/Text.tsx` wraps React Native `Text` — reads `fontWeight` from the style prop and maps it to the correct DM Sans font family name (`DMSans_700Bold` for `'700'`, etc.), so `fontWeight` works correctly on iOS where it otherwise has no effect on custom fonts. All 18 files that imported `Text` from `react-native` updated to import from the custom wrapper.

`constants/colors.ts` fully rewritten to match THEME.md exactly. Light mode: `background #F5F2EE`, `card #FDFCFA`, `surface2 #F0EDE8`, `text #1C1612`, `mutedText #6B5E52`, `subtleText #A8998C`, `primary #3D6B5A`, `primarySoft #EBF2EE`, rgba borders. Dark mode: neutral grays, `primary #52A882`, no warm cast. All missing tokens added: `surface2`, `subtleText`, `borderMd`, `accent2`, `accent2Bg`, `amber`, `locked`, `danger`, and per-type color pairs (`audioBg/audioFg`, `caseBg/caseFg`, `videoBg/videoFg`). `ContentCard` updated to use THEME.md type color tokens and proper `typeBg` for badges — dark mode variants applied correctly.

**Bug fix**

`lydbibliotek.tsx`: `useEffect` was missing from the React import, causing a crash in the `FadeIn` animation component.

**Favicon**

`frontend/public/logo.svg`: standalone SVG favicon with transparent background. Embedded CSS media query applies `fill: #1C1612` in light mode and `fill: #EDEDEC` in dark mode — follows OS `prefers-color-scheme`, no background rect. PNG fallbacks (`favicon-96x96.png`, `favicon.ico`, `apple-touch-icon.png`) and web app manifest PNGs added to `public/`. `index.html` updated with favicon link tags. `site.webmanifest` name set to "Urometoden", `theme_color` and `background_color` set to `#F5F2EE`.

---

## 08.05.2026

**Email/password auth (web + mobile)**

Migration 013 adds `password_resets` table (`token`, `user_id`, `expires_at`, `used_at`). `identities.credential` (already present) stores the password hash. Passwords are hashed with PBKDF2-SHA256 at 100 000 iterations via `crypto.subtle` in a new `functions/lib/password.js`. Session creation logic extracted to `functions/lib/session.js` (`createWebSession` / `createNativeSession`) and reused across all auth endpoints.

New web endpoints: `POST /api/auth/signup`, `POST /api/auth/signin-email` (both set a 30-day HttpOnly session cookie and return JSON). New mobile endpoints: `POST /api/auth/native-email-signup`, `POST /api/auth/native-email-signin` (both return a 90-day JWT matching the Google auth shape). Password reset: `POST /api/auth/reset-request` generates a 32-byte hex token, stores it (1-hour TTL), and sends a reset email via Resend (`noreply@urometoden.no`); `POST /api/auth/reset-confirm` validates the token and upserts the new credential. If an email-only user signs up with an email that already has a Google identity, the password credential is linked to the existing account rather than creating a duplicate. Email verification intentionally skipped — noted in TODO for pre-launch.

Web `OnboardingPage` rewritten: Google | E-post tab switcher; email tab supports sign-in, sign-up (with confirm-password), reset-request, and reset-confirm modes. Reset confirm mode auto-activates when `?reset_token=` is present in the URL.

Mobile `auth/signin.tsx` rewritten: Sosiale | E-post tabs; email tab supports sign-in, sign-up, and reset-request forms with inline error/success feedback. `AuthContext` extended with `signInWithEmail`, `signUpWithEmail`, and `requestPasswordReset`.

**Mobile TODO items resolved**

Lydbibliotek: fetches `/api/me/progress` in parallel with content on every focus; `completed` and `progress` props on `ContentCard` now reflect real DB state. `ContentModal` "Lest" button (cases) PATCHes `/api/me/progress/[itemId]` with `completed: true` and fires an `onComplete` callback so the parent list updates immediately without a refetch. Week detail (`uke/[id].tsx`) fires `POST /api/me/weeks/[weekId]/start` once on first mount via a ref guard. Home screen fetches `/api/me/progress` on focus and shows the active week number, title, and completion count in the journey card; "Fortsett" navigates directly to the active week.

Reflections screen rewritten: GDPR Article 9 consent gate (inline card, POSTs to `/api/me/consent`) shown before the input; list fetched from new `GET /api/me/reflections`; entries created via `POST /api/me/reflections` (standalone UUID item_id); delete via `DELETE /api/me/reflections/[itemId]` with confirmation dialog. New backend `reflections.js` handles GET/POST; DELETE added to existing `reflections/[itemId].js`.

---

## 07.05.2026 (continued x4)

React Native / Expo mobile app — full initial build.

**Infrastructure**

EAS Build configured (`eas.json`, `app.json` with `no.urometoden.app` bundle ID, EAS project ID). `expo-av` and `expo-haptics` added as native modules requiring a managed build. `@react-native-google-signin/google-signin` replaces `expo-auth-session` (abandoned after persistent redirect_uri_mismatch and Android client incompatibility with browser-based OAuth). SHA-1 from the EAS keystore registered in Google Cloud Console for the Android OAuth client.

Backend additions for mobile: `POST /api/auth/native` accepts a Google access token, looks up or creates the user, and returns a JWT — same session model as the web OAuth callback. `auth.js` extended to read the session token from a `?token=` query parameter in addition to the cookie and `Authorization` header, so `expo-av` can stream audio without custom request headers.

**Audio player**

`PlayerContext` (React Context + `expo-av`) manages global playback state: current track, position, duration, play/pause/seek, ±15 s skip, fullscreen flag. `MiniPlayer` — a persistent bar above the tab bar showing track title, progress strip, and play/pause button. `FullPlayer` — pageSheet modal with PanResponder drag-to-dismiss, scrubber, ±15 s skip buttons, and haptic feedback. `PlayerProvider` placed at the root layout (not tabs layout) so stack screens outside the tab group share the same player instance. `MiniPlayer` absolutely positioned at `bottom: 88` to float above the tab bar on tab screens and remain visible on stack screens.

**Screens**

- `hjem.tsx` — time-based greeting with user first name, daily tip fetched from `/api/tip`, "Din reise" journey card, and shortcut links to library, reflections, and kurs.
- `reise.tsx` — 8-week timeline fetching real completion data from `/api/me/progress`; week cards show locked/active/completed states with timeline connector line; taps navigate to `/uke/[id]`.
- `uke/[id].tsx` — week detail screen; fetches `/api/weeks/[weekId]/content` and `/api/me/progress` on focus; shows completion progress bar, ContentCards with per-item audio progress, ContentModal on tap.
- `lydbibliotek.tsx` — library with type filter chips (Alle / Lydøkter / Case / Refleksjon / Video), grouped sections, ContentCards, ContentModal. Filters re-fetch on change.
- `kurs.tsx` — live events from `/api/events` in a horizontal scroll row; event detail modal with type badge, cancelled state, and reveal_pending handling; paginated archive modal (list → drill-in detail → back navigation) matching the web layout; Urofordypning and Uro-skolen sections from `/api/section-cards` with `Linking.openURL` for external links.
- `profil.tsx` — real user data (name, email, membership badge) and stats from `/api/me/stats` (streak, listen hours, weeks completed); progress card with live completion percentage; gear icon opens a settings modal (pageSheet) with Profil and Innstillinger tabs. Profil tab: avatar initials, field rows, sign out, danger zone with two-step delete account. Innstillinger tab: animated dark/light theme toggle, disabled notification toggles with "kommer snart" note.

**Shared components**

`ContentCard` — type badge, title, abstract, meta, audio progress bar, completion checkmark. `ContentModal` — pageSheet detail view with body text, week chips, "Lytt" button (audio) and "Lest" button (case) wired to PlayerContext. Both components shared between the library and week detail screens.

**TODO**

New mobile section added: reflections screen (local state only, needs API wiring), email/password auth, lydbibliotek completion indicators always zero, content completion not posted to backend, audio position not saved, week start endpoint never called, home page journey card is static, MiniPlayer bottom offset on stack screens.

---

## 07.05.2026 (continued x3)

Section cards and admin Kalender tab redesign.

Migration 012 adds `section_cards` table: `section` (fordypning | uroskolen), `icon`, `title`, `description`, `link`, `link_label`, `sort_order`. Seeded with the 4 cards that were previously hardcoded in KursPage.

`CardIcons.jsx` — shared icon library (16 icons: user, calendar-days, info, layers, heart, book, star, compass, leaf, sun, moon, chat, video, award, music, home). Exports `CardIcon({ name, size })` and `CARD_ICON_KEYS` / `CARD_ICON_LABELS` for the admin icon picker.

New API endpoints:

- `GET /api/section-cards` — auth-required; returns all section cards ordered by section + sort_order
- `GET /api/admin/section-cards` — admin GET (same query)
- `POST /api/admin/section-cards` — create card; logs `section_card.created`
- `PATCH /api/admin/section-cards/:id` — update fields; logs `section_card.updated`
- `DELETE /api/admin/section-cards/:id` — delete; logs `section_card.deleted`

`AdminKalenderTab` rewritten: three-section layout (Kurs / Urofordypning / Uro-skolen) matching the user-facing KursPage design. Each card shows an admin hover overlay with pencil, cancel/restore (events only), and trash buttons. Event form unchanged. New card form includes a visual 8-column icon picker, section selector, title, description, link, and link-label fields. Dashed "add" placeholder cards at the end of each scroll row.

`KursPage` updated: Urofordypning and Uro-skolen sections now fetch from `GET /api/section-cards` and render `KursCard` components with DB data. `BookingModal` replaced by generic `CardModal` (no OK button — X only); modal shows icon, title, description, and an optional link button using the card's `link_label`. `EventDetailModal` loses its Lukk footer button — X closes only. `ArchiveModal` detail view unchanged (already X-only).

Audit log catalog extended with `section_card.created`, `section_card.updated`, `section_card.deleted` events. `describeExtra` now shows titles for `section_card.*` events.

---

## 07.05.2026 (continued x2)

Audit log system. Migration 011 adds a `logs` table (event, tag, actor_id, target_id, meta JSON, created_at). No FK constraints on actor/target — the audit trail intentionally survives user and event deletion. Indexed on created_at, tag, and event.

`lib/logger.js` — shared `logEvent(env, { event, tag, actorId, targetId, meta })` helper used by all instrumented endpoints.

Events now logged:

- `user.signup` (tag: bruker) — new Google OAuth user, detected pre-upsert in `callback.js`
- `user.trial_granted` / `user.member_granted` / `user.access_revoked` (tag: tilgang) — admin membership changes in `admin/users/[id].js`
- `user.admin_promoted` / `user.admin_revoked` (tag: admin) — admin flag changes
- `user.membership_expired` (tag: tilgang) — lazy expiry in `me.js`
- `user.account_deleted` (tag: bruker) — logged before deletion in `me/account.js`; name+email stored in meta since user row is gone after
- `event.created` / `event.updated` / `event.cancelled` / `event.restored` / `event.deleted` (tag: arrangement) — all event CRUD in admin endpoints; event title stored in meta

`GET /api/admin/logs` — paginated log reader (admin-only). Supports `tag` filter and `page`/`per_page`. JOINs `users` for actor/target names; handles deleted users via meta fallback in the UI.

Admin "Logg" tab (`AdminLoggTab`): tag filter pills (Alle / Bruker / Tilgang / Admin / Arrangement), log rows with coloured tag badge, human-readable event label, target/actor names, relative timestamp, "Vis mer" load-more button. Inline TODO comments mark future events (event signup, check-in, event.ended, week completion) pending those features.

---

## 07.05.2026 (continued)

Membership expiry enforcement. Migration 010 adds `has_used_trial INTEGER NOT NULL DEFAULT 0` to `users`.

`GET /api/auth/me` now lazily expires memberships on every login: if `membership_expires_at` is in the past and `membership != 'none'`, the row is updated to `membership = 'none', membership_expires_at = NULL` before the response is returned. This keeps the DB clean without a cron job.

Admin user management:

- `PATCH /api/admin/users/:id` automatically sets `has_used_trial = 1` whenever `membership = 'trial'` is granted. The field is now included in both the PATCH response and the GET list.
- `MemberBadge` component checks `membership_expires_at > now` before rendering the coloured trial/member badge — expired users now correctly show "Ingen tilgang" without waiting for a DB cleanup.
- Admin user rows show a muted "Prøve brukt" badge when `has_used_trial = 1`, giving admins visibility into repeat trial requests.

---

## 07.05.2026

Profil and Innstillinger modal. Clicking either item in the avatar dropdown now opens a split-pane `SettingsModal` (168 px sidebar + scrollable content area) instead of being disabled placeholders.

Profil panel: avatar initials, display name, email, membership badge (Medlem / Prøveperiode N dager igjen / Ikke medlem), and read-only field rows for name, email, and membership status. Danger zone at the bottom with a "Slett konto" button that transitions the panel to a centered confirmation step before executing deletion.

Account deletion (`DELETE /api/me/account`): batch-deletes all user rows — `user_progress`, `user_reflections`, `user_week_progress`, `user_state`, `user_login_days`, `sessions`, `users` (identities cascade automatically). Clears the session cookie in the response. Frontend calls `setUser(null)` after the request, which transitions to the onboarding screen. TODO comment in the endpoint to update the delete list when new user-linked tables are added.

Innstillinger panel: working dark/light theme toggle (replaces the toggle that was only in the TopNav). Three mock notification toggles (e-postvarsler, ukentlige påminnelser, fremdriftsoppsummering) rendered as disabled with a "kommer snart" hint.

---

## 05.05.2026 (continued)

Events system. Migration 009 adds an `events` table (title, event_date ms, type `online|fysisk`, location, link, description, reveal_at, cancelled/cancelled_at, created_at, updated_at).

Public-facing events API (`GET /api/events`, auth required):

- Upcoming mode: events within a 1-hour grace window after their start time; cancelled events remain visible for 3 days or until their planned datetime (whichever is shorter).
- Archive mode (`?archive=1`): paginated past events with `hasMore` flag.
- `sanitizeEvent` strips `link` and `location` and sets `reveal_pending: true` when `reveal_at` is still in the future.

Admin events API:

- `GET /api/admin/events` — all events, ordered by date desc.
- `POST /api/admin/events` — create (validates title, event_date, type).
- `PATCH /api/admin/events/:id` — update fields or toggle `cancel: true/false`.
- `DELETE /api/admin/events/:id` — hard delete.

Kurs page rewritten:

- Section order changed to Kurs (events) → Urofordypning → Uro-skolen.
- Kurs section fetches `/api/events` on mount and renders event cards in a horizontal scroll row (title, type badge, date/time, location if revealed, description truncated to 120 chars). Clicking a card opens a detail modal. Empty state when no upcoming events. "Vis tidligere hendelser" link opens a paginated archive modal (back-button navigation within the modal to event detail).
- Urofordypning section replaces "Kurs" card with "Fordypningsretreat". Booking modal retained.

Admin "Kalender" tab (new `AdminKalenderTab`):

- Lists all events with status badges (Kommende / Passert / Avlyst).
- "Ny hendelse" button opens an overlay form (title, datetime-local, type select, location, link, description, reveal_at datetime).
- Edit opens the same form pre-filled.
- Avlys/Gjenopprett toggle; delete with confirmation dialog.

Dashboard: when all week content is done and no active week exists, the next locked week drives a live countdown (`useCountdown`, 1-second interval). Shows "Neste uke" with lock icon and HH:MM:SS countdown when waiting for the next unlock. Button label changes to "Gå til uke N →" when locked vs "Fortsett reisen" / "Start reisen".

RightPanel "Neste uke" section: label updates every 5 minutes via `useUnlockLabel` hook ("Åpner om N dager/timer/min"). Section hidden when all 8 weeks are completed.

Journey page (`/praksis`): heading changed from "Uroreisen" to "Uropraksis".

---

## 05.05.2026

Client-side routing with React Router v6. All main sections now have stable, bookmarkable URLs. `public/_redirects` (`/* /index.html 200`) enables direct URL loads and refresh on Cloudflare Pages without any dashboard changes.

Route map:

- `/` → Dashboard (Hjem)
- `/praksis` → Journey overview (renamed from Reisen)
- `/praksis/uke/1–8` → Weekly content
- `/bibliotek` → Bibliotek
- `/kurs` → Kurs
- `/hjelp` → Help
- `/admin` → Admin (early return, no app chrome)
- `*` → redirect to `/`

"Reisen" tab renamed to "Praksis" throughout. TopNav derives active state from `useLocation` — no `activePage` prop needed from App. `activeWeek` state removed; current week derived from `useMatch('/praksis/uke/:weekId')` and passed to Sidebar.

Week gating at `/praksis/uke/:weekId`: non-members redirect to `/`; invalid week numbers redirect to `/praksis`; locked weeks render a `LockedWeekView` in-place (lock icon + unlock countdown) rather than redirecting — URL stays stable for bookmarks. Gate only activates once `progressLoaded` is true to avoid false locks during initial data fetch.

Kurs page: "Én-til-én veiledning" card now opens a booking modal with a description, a `Gå til timebestilling →` hyperlink to urometoden.no (opens in new tab), and an OK button. Closes on OK, X, Escape, or backdrop click.

---

## 04.05.2026 (continued)

Week completion state on the home page. When all items in a week are done, a `✓ Fullført` chip appears inline next to the week label. A card at the bottom of the page shows next week's status: if locked, it shows the next week's title, a lock icon, and "Neste uke låses opp om N dager" — admin users also see the dev unlock button here. If unlocked, it shows the next week's title, description, and a "Gå til uke N →" CTA. Week 8 shows a congratulations message instead. `useWeekProgress` now also exports `unlockAt` (a `Date` object from `getUnlockTime`) alongside `daysUntilUnlock`.

Congratulations modal on week completion (weeks 1–7). A `CongratsModal` fires once when `allComplete` transitions from false to true during a session — it does not appear on page load for already-completed weeks, and resets on week change. The modal shows the exact unlock date and time ("Låses opp onsdag 7. mai kl. 10:00") when the next week is locked, or a "Gå til uke N →" CTA when it is already available.

Audio from library modal now auto-plays on entering fullscreen. When "Lytt" is clicked in `AudioModal`, the `AudioPlayer` mounts with `autoFullscreen`. A `shouldAutoPlay` ref triggers `play()` inside the position-restore handler (after seek) so playback starts from the saved position without a jump from 0.

---

## 04.05.2026

File upload to R2 from the admin panel. New `POST /api/admin/upload` endpoint validates key (extension allowlist, no path traversal), streams the file body to `env.AUDIO_BUCKET.put()`. The file picker in the Innhold tab gains an "Last opp ny fil" tab with a file input, an editable rename field pre-filled from the local filename, and an upload button. On success the picker closes and the `r2_key` field is set automatically.

GDPR Article 9 consent gate for reflections. Migration 008 adds `reflection_consent_at INTEGER` to `user_state`. New `POST /api/me/consent` endpoint records the timestamp. `/api/me/progress` now returns `reflection_consent_at`. `useUserProgress` exposes `reflectionConsent` boolean and `grantReflectionConsent()`. A `ConsentModal` (accordion explanation + checkbox + OK/X) intercepts the first click on any reflection card in both the weekly view and the library — the modal reappears on every visit until the user consents. TODO updated to emphasise DPIA as the remaining hard blocker before launch.

Manual complete checkbox on weekly content cards. Each card in the weekly view now shows a faint checkbox button (top-right). Hovering the card raises its opacity; hovering the button directly makes it fully visible with an accent border. Clicking opens a `ConfirmCompleteModal` asking for confirmation before calling `markComplete`. Once complete the button fills with accent colour and a white checkmark. BibliotekPage is unchanged.

Kurs page implemented. New `KursPage` with three sections — Urofordypning, Kurs, Uro-skolen — each rendered as a horizontal scroll row of snap cards (icon + title + description). Cards are ~50% of the available width. Kurs tab enabled in TopNav (`active: false → true`).

Onboarding page now uses the `UroLogo` SVG component instead of the "Uro" script-font text string.

---

## 01.05.2026 (continued)

User progression migrated to D1 (migration 006). Five new tables: `user_progress` (per-item completion, `position_seconds` resume point, `listen_seconds` cumulative), `user_reflections` (reflection text), `user_week_progress` (week start + completion timestamps), `user_state` (active week), `user_login_days` (one row per Oslo date for streak).

New API endpoints under `/api/me/`:

- `GET /api/me/progress` — full progress snapshot (progress map, reflections map, weeks map, active week)
- `PATCH /api/me/progress/[itemId]` — upsert position/listen/completed; auto-detects week completion server-side
- `PATCH /api/me/reflections/[itemId]` — saves reflection text, marks item complete, checks week completion
- `POST /api/me/weeks/[weekId]/start` — sets week `started_at` if not set, updates active week; `?unlock=dev` (admin only) back-dates `started_at` to 6 days ago for instant unlock
- `GET /api/me/stats` — streak, total listen seconds, weeks completed

`GET /api/auth/me` now inserts a `user_login_days` row on every request (INSERT OR IGNORE) for streak tracking.

Frontend:

- New `useUserProgress` hook centralises all DB progress state — fetches progress + stats on mount, exposes `startWeek`, `devUnlockWeek`, `updateProgress`, `updateReflection`.
- `useWeekProgress` rewritten to derive week statuses from DB `started_at`/`completed_at` data instead of localStorage. Week unlock logic (5-day gate, Oslo 10:00) preserved.
- `App.jsx` wires both hooks; progress props threaded to `HomePage`, `BibliotekPage`, `DashboardPage`.
- `AudioPlayer` tracks listen time (accumulated only while playing), saves to DB every 15 s and on pause/seek/close. Restores `position_seconds` on load. Auto-completes item at 90% listened. Progress bar threshold: 60 s minimum listen before bar appears.
- `ContentCard` gains `listenSeconds` + `positionSeconds` props; renders a 2px progress bar for audio/video when `listenSeconds ≥ 60`.
- `ReflectionModal` — `onSave(text)` callback replaces direct localStorage write; falls back to localStorage for existing data (migration on first save).
- `CaseModal` — auto-closes 400 ms after "Lest" is clicked.
- Dashboard `MemberDashboard` gains a 4-card stat grid: lyttetid, dager på rad (🔥 at 3+), uker fullført, placeholder.
- Dev unlock button in `HomePage` now requires `isAdmin` (was visible to all users).

---

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
