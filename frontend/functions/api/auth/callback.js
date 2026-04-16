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

  const tokens = await tokenRes.json()
  if (!tokens.access_token) {
    return new Response('Token exchange failed', { status: 502 })
  }

  // Fetch Google user info
  const userRes    = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const googleUser = await userRes.json()

  // Upsert user in D1
  await env.DB.prepare(`
    INSERT INTO users (google_id, email, name, created_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(google_id) DO UPDATE SET email = excluded.email, name = excluded.name
  `).bind(googleUser.sub, googleUser.email, googleUser.name, Date.now()).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ?')
    .bind(googleUser.sub).first()

  // Sign session JWT (30 days)
  const token  = await signJwt(
    { sub: user.id, email: user.email, name: user.name, is_admin: user.is_admin },
    env.AUTH_SECRET
  )

  const secure  = url.protocol === 'https:' ? '; Secure' : ''
  const maxAge  = 60 * 60 * 24 * 30
  const headers = new Headers()
  headers.set('Location', '/')
  headers.append('Set-Cookie', `oauth_state=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
  headers.append('Set-Cookie', `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}`)

  return new Response(null, { status: 302, headers })
}
