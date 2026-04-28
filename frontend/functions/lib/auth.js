import { verifyJwt, parseCookies } from './jwt.js'

export async function getSession(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie') || '')
  const token   = cookies.session
  if (!token) return null
  const payload = await verifyJwt(token, env.AUTH_SECRET)
  if (!payload) return null

  // If the JWT carries a session ID, verify it hasn't been revoked
  if (payload.sid) {
    const row = await env.DB.prepare(
      'SELECT revoked FROM sessions WHERE id = ?'
    ).bind(payload.sid).first()
    if (!row || row.revoked) return null
  }

  return payload
}

export async function requireAdmin(request, env) {
  const payload = await getSession(request, env)
  if (!payload) return null
  // Always check DB — JWT claim can be stale if is_admin was granted after sign-in
  const user = await env.DB.prepare('SELECT is_admin FROM users WHERE id = ?')
    .bind(payload.sub).first()
  if (!user?.is_admin) return null
  return payload
}
