import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { results } = await env.DB.prepare(`
    SELECT * FROM daily_prompts
    ORDER BY
      CASE WHEN prompt_date IS NOT NULL THEN 0 ELSE 1 END,
      prompt_date DESC,
      id DESC
  `).all()

  return Response.json(results)
}

export async function onRequestPost({ env, request }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const { prompt_date, body } = await request.json()

  if (!body?.trim())
    return new Response('Body required', { status: 400 })

  // prompt_date is optional — omit or pass null for a pool prompt; pass YYYY-MM-DD for a date override
  const dateValue = prompt_date?.trim() || null
  if (dateValue && !/^\d{4}-\d{2}-\d{2}$/.test(dateValue))
    return new Response('Valid prompt_date (YYYY-MM-DD) required', { status: 400 })

  try {
    const result = await env.DB.prepare(
      'INSERT INTO daily_prompts (prompt_date, body) VALUES (?, ?) RETURNING *'
    ).bind(dateValue, body.trim()).first()

    await logEvent(env, {
      event:   'daily_prompt.created',
      tag:     'innhold',
      actorId: caller.sub,
      meta:    { prompt_date: dateValue, type: dateValue ? 'override' : 'pool', body_preview: body.trim().slice(0, 60) },
    })

    return Response.json(result, { status: 201 })
  } catch (e) {
    if (e.message?.includes('UNIQUE'))
      return new Response('That date already has a prompt', { status: 409 })
    throw e
  }
}
