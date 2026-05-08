import { signJwt } from './jwt.js'

export async function createWebSession(user, env, request) {
  const now    = Date.now()
  const maxAge = 60 * 60 * 24 * 30
  const sid    = crypto.randomUUID()

  await env.DB.prepare(
    'DELETE FROM sessions WHERE user_id = ? AND (expires_at < ? OR revoked = 1)'
  ).bind(user.id, now).run()

  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sid, user.id, now, now + maxAge * 1000).run()

  const token  = await signJwt(
    { sub: user.id, email: user.email, name: user.name, is_admin: user.is_admin ?? 0, sid },
    env.AUTH_SECRET
  )
  const url    = new URL(request.url)
  const secure = url.protocol === 'https:' ? '; Secure' : ''
  return { token, cookie: `session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}${secure}` }
}

export async function createNativeSession(user, env) {
  const now             = Date.now()
  const SESSION_90_DAYS = 60 * 60 * 24 * 90

  await env.DB.prepare(
    'DELETE FROM sessions WHERE user_id = ? AND (expires_at < ? OR revoked = 1)'
  ).bind(user.id, now).run()

  const sid = crypto.randomUUID()
  await env.DB.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(sid, user.id, now, now + SESSION_90_DAYS * 1000).run()

  const token = await signJwt(
    { sub: user.id, email: user.email, name: user.name, is_admin: user.is_admin ?? 0, sid },
    env.AUTH_SECRET,
    SESSION_90_DAYS
  )
  return {
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
  }
}
