import { signJwt } from '../../lib/jwt.js'
import { logEvent } from '../../lib/logger.js'

const SESSION_90_DAYS = 60 * 60 * 24 * 90

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { access_token } = body ?? {}
  if (!access_token) return new Response('Missing access_token', { status: 400 })

  // Verify token and get user info from Google
  const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!googleRes.ok) return new Response('Invalid Google token', { status: 401 })

  const { sub, email, name, email_verified } = await googleRes.json()
  if (!email || !email_verified) return new Response('Unverified email', { status: 401 })

  const now = Date.now()

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  const isNewUser = !existing

  // Upsert user
  await env.DB.prepare(`
    INSERT INTO users (email, name, created_at)
    VALUES (?, ?, ?)
    ON CONFLICT(email) DO UPDATE SET name = excluded.name
  `).bind(email, name ?? email, now).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()

  // Upsert identity
  await env.DB.prepare(`
    INSERT INTO identities (user_id, provider, provider_id, created_at)
    VALUES (?, 'google', ?, ?)
    ON CONFLICT(provider, provider_id) DO NOTHING
  `).bind(user.id, sub, now).run()

  if (isNewUser) {
    await logEvent(env, {
      event:    'user.signup',
      tag:      'bruker',
      targetId: user.id,
      meta:     { email: user.email, source: 'mobile' },
    })
  }

  // Purge stale sessions
  await env.DB.prepare(
    'DELETE FROM sessions WHERE user_id = ? AND (expires_at < ? OR revoked = 1)'
  ).bind(user.id, now).run()

  // Create revocable session (90 days for mobile)
  const sid = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sid, user.id, now, now + SESSION_90_DAYS * 1000).run()

  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, is_admin: user.is_admin, sid },
    env.AUTH_SECRET,
    SESSION_90_DAYS
  )

  return Response.json({
    token,
    user: {
      id:                    user.id,
      name:                  user.name,
      email:                 user.email,
      membership:            user.membership,
      membership_expires_at: user.membership_expires_at,
      has_used_trial:        user.has_used_trial,
      is_admin:              user.is_admin,
    },
  })
}
