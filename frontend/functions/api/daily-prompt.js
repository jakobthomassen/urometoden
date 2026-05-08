import { getSession } from '../lib/auth.js'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export async function onRequestGet({ env, request }) {
  const user = await getSession(request, env)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const date = todayStr()
  const now  = Date.now()

  // 1. Date override: a prompt explicitly assigned to today always takes priority
  let prompt = await env.DB.prepare(
    'SELECT * FROM daily_prompts WHERE prompt_date = ?'
  ).bind(date).first()

  // 2. Pool fallback: rotate through pool prompts (prompt_date IS NULL)
  if (!prompt) {
    // Already picked a pool prompt for today?
    prompt = await env.DB.prepare(
      'SELECT * FROM daily_prompts WHERE prompt_date IS NULL AND used_date = ?'
    ).bind(date).first()

    if (!prompt) {
      // Pick a random unused pool prompt
      prompt = await env.DB.prepare(
        'SELECT * FROM daily_prompts WHERE prompt_date IS NULL AND used_at IS NULL ORDER BY RANDOM() LIMIT 1'
      ).first()

      if (!prompt) {
        // Reset pool prompts outside the 7-day grace window so they can repeat
        await env.DB.prepare(
          'UPDATE daily_prompts SET used_at = NULL, used_date = NULL WHERE prompt_date IS NULL AND used_at < ?'
        ).bind(now - SEVEN_DAYS).run()

        prompt = await env.DB.prepare(
          'SELECT * FROM daily_prompts WHERE prompt_date IS NULL AND used_at IS NULL ORDER BY RANDOM() LIMIT 1'
        ).first()
      }

      // All pool prompts within 7-day window — fall back to the oldest used
      if (!prompt) {
        prompt = await env.DB.prepare(
          'SELECT * FROM daily_prompts WHERE prompt_date IS NULL ORDER BY used_at ASC LIMIT 1'
        ).first()
      }

      if (prompt) {
        await env.DB.prepare(
          'UPDATE daily_prompts SET used_at = ?, used_date = ? WHERE id = ?'
        ).bind(now, date, prompt.id).run()
      }
    }
  }

  const reflection = await env.DB.prepare(
    'SELECT * FROM user_daily_reflections WHERE user_id = ? AND prompt_date = ?'
  ).bind(user.sub, date).first()

  return Response.json({ prompt, reflection, date })
}
