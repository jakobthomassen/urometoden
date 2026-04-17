import { verifyJwt, parseCookies } from './jwt.js'

export async function getSession(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie') || '')
  const token   = cookies.session
  if (!token) return null
  return verifyJwt(token, env.AUTH_SECRET)
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
