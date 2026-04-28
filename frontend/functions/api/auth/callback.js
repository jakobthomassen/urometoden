import { signJwt, parseCookies } from '../../lib/jwt.js'

export async function onRequestGet({ env, request }) {
  const url      = new URL(request.url)
  const code     = url.searchParams.get('code')
  const state    = url.searchParams.get('state')
  const cookies  = parseCookies(request.headers.get('Cookie'))

  if (!code || !state || state !== cookies.oauth_state) {
    return new Response('Invalid request', { status: 400 })
  }

  const redirectUri = `${url.origin}/api/auth/callback`

  // Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }),
  })

  if (!tokenRes.ok) return new Response('Token exchange failed', { status: 502 })

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return new Response('Token exchange failed', { status: 502 })
  }

  // Fetch Google user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!userRes.ok) return new Response('Failed to fetch user info', { status: 502 })

  const googleUser = await userRes.json()
  if (!googleUser.email) return new Response('Invalid user info', { status: 502 })

  const now = Date.now()

  // Upsert user by email
  await env.DB.prepare(`
    INSERT INTO users (email, name, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET name = excluded.name
  `).bind(googleUser.email, googleUser.name, now).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
    .bind(googleUser.email).first()

  // Upsert identity row
  await env.DB.prepare(`
    INSERT INTO identities (user_id, provider, provider_id, created_at)
    VALUES (?, 'google', ?, ?)
    ON CONFLICT(provider, provider_id) DO NOTHING
  `).bind(user.id, googleUser.sub, now).run()

  // Create a revocable session row
  const sid      = crypto.randomUUID()
  const maxAge   = 60 * 60 * 24 * 30
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sid, user.id, now, now + maxAge * 1000).run()

  // Sign session JWT (30 days) — includes sid for revocation checks
  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, is_admin: user.is_admin, sid },
    env.AUTH_SECRET
  )

  const secure  = url.protocol === 'https:' ? '; Secure' : ''
  const headers = new Headers()
  headers.set('Location', '/')
  headers.append('Set-Cookie', `oauth_state=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
  headers.append('Set-Cookie', `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`)


  return new Response(null, { status: 302, headers })
}
