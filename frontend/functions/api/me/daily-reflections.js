import { getSession } from '../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  const user = await getSession(request, env)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { results } = await env.DB.prepare(`
    SELECT dr.id, dr.prompt_date, dr.body, dr.updated_at,
           dp.body AS prompt_body
    FROM user_daily_reflections dr
    LEFT JOIN daily_prompts dp ON dp.prompt_date = dr.prompt_date
    WHERE dr.user_id = ?
    ORDER BY dr.prompt_date DESC
  `).bind(user.sub).all()

  return Response.json(results)
}
