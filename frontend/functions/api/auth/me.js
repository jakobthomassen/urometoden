import { getSession } from '../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  // Fetch live from DB so membership and is_admin are always current
  const user = await env.DB.prepare(
    'SELECT id, email, name, display_name, is_admin, membership, membership_expires_at, has_used_trial FROM users WHERE id = ?'
  ).bind(payload.sub).first()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Lazily expire membership/trial when the expiry timestamp has passed
  const now = Date.now()
  if (user.membership !== 'none' && user.membership_expires_at && user.membership_expires_at <= now) {
    await env.DB.prepare(
      "UPDATE users SET membership = 'none', membership_expires_at = NULL WHERE id = ?"
    ).bind(user.id).run()
    user.membership            = 'none'
    user.membership_expires_at = null
  }

  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  await env.DB.prepare('INSERT OR IGNORE INTO user_login_days (user_id, day) VALUES (?, ?)')
    .bind(user.id, today).run()

  return Response.json(user, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
