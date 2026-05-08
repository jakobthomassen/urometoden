import { getSession } from '../../lib/auth.js'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function onRequestPost({ env, request }) {
  const user = await getSession(request, env)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { body } = await request.json()
  if (body === undefined || body === null) return new Response('Body required', { status: 400 })

  const date = todayStr()
  const now  = Date.now()

  const result = await env.DB.prepare(`
    INSERT INTO user_daily_reflections (user_id, prompt_date, body, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, prompt_date) DO UPDATE
      SET body = excluded.body, updated_at = excluded.updated_at
    RETURNING *
  `).bind(user.sub, date, body.trim(), now).first()

  return Response.json(result)
}
