import { getSession } from '../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  const payload = await getSession(request, env)
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
