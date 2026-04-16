import { verifyJwt, parseCookies } from './jwt.js'

export async function getSession(request, env) {
  const cookies = parseCookies(request.headers.get('Cookie') || '')
  const token   = cookies.session
  if (!token) return null
  return verifyJwt(token, env.AUTH_SECRET)
}

export async function requireAdmin(request, env) {
  const payload = await getSession(request, env)
  if (!payload?.is_admin) return null
  return payload
}
