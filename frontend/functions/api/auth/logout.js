import { verifyJwt, parseCookies } from '../../lib/jwt.js'

export async function onRequestPost({ env, request }) {
  // Revoke the session in DB so the JWT can't be reused even if still valid
  const token = parseCookies(request.headers.get('Cookie') || '').session
  if (token) {
    const payload = await verifyJwt(token, env.AUTH_SECRET)
    if (payload?.sid) {
      await env.DB.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?')
        .bind(payload.sid).run()
    }
  }

  const headers = new Headers()
  headers.set('Location', '/')
  headers.set('Set-Cookie', 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0')
  return new Response(null, { status: 302, headers })
}
