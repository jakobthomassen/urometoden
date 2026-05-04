import { getSession } from '../../lib/auth.js'

export async function onRequestPost({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  await env.DB.prepare(`
    INSERT INTO user_state (user_id, active_week, reflection_consent_at)
    VALUES (?, 1, ?)
    ON CONFLICT(user_id) DO UPDATE SET reflection_consent_at = excluded.reflection_consent_at
  `).bind(payload.sub, Date.now()).run()

  return Response.json({ ok: true })
}
