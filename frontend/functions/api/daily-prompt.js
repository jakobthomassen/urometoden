import { requireAuth } from '../lib/auth.js'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function onRequestGet({ env, request }) {
  const user = await requireAuth(request, env)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const date = todayStr()

  const [prompt, reflection] = await Promise.all([
    env.DB.prepare('SELECT * FROM daily_prompts WHERE prompt_date = ?').bind(date).first(),
    env.DB.prepare(
      'SELECT * FROM user_daily_reflections WHERE user_id = ? AND prompt_date = ?'
    ).bind(user.sub, date).first(),
  ])

  return Response.json({ prompt, reflection, date })
}
