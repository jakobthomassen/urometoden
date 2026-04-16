import { verifyJwt, parseCookies } from '../../lib/jwt.js'

export async function onRequestGet({ env, request }) {
  const cookies = parseCookies(request.headers.get('Cookie'))
  const token   = cookies.session
  if (!token) return new Response('Unauthorized', { status: 401 })

  const payload = await verifyJwt(token, env.AUTH_SECRET)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  // Fetch live from DB so membership and is_admin are always current
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?')
    .bind(payload.sub).first()
  if (!user) return new Response('Unauthorized', { status: 401 })

  return Response.json({
    id:                    user.id,
    email:                 user.email,
    name:                  user.name,
    display_name:          user.display_name,
    is_admin:              user.is_admin,
    membership:            user.membership,
    membership_expires_at: user.membership_expires_at,
  })
}
