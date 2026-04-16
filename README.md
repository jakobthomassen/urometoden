# Urometoden

Cloudflare Pages + React (Vite) frontend. R2 for audio files. D1 for content and user data.

---

## Local development

### UI only (recommended for design work)

```bash
cd frontend
npm run dev
```

Starts Vite at `localhost:5173` with hot reload. API calls to `/api/...` will fail silently — content cards won't load, but all layout and component work is unaffected.

### Full stack (UI + API + DB)

Requires a production build before each session. No hot reload.

```bash
cd frontend
npm run build
npx wrangler pages dev ./dist --d1=DB --r2=AUDIO_BUCKET
```

Starts at `localhost:8788`. Use this when testing DB reads/writes or audio proxying.

---

## Database

```bash
# Apply schema (first time or after schema changes)
npx wrangler d1 execute urometoden-db --remote --file=../schema.sql

# Seed content data
npx wrangler d1 execute urometoden-db --remote --file=../seed.sql
```

Both commands run against the production D1 instance. For local execution replace `--remote` with `--local`.

---

## Deploy

Cloudflare Pages deploys automatically on push to `master`. No manual deploy step needed.
