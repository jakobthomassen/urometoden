import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestPatch({ env, request, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  const { body } = await request.json()
  if (!body?.trim()) return new Response('Body required', { status: 400 })

  const result = await env.DB.prepare(
    'UPDATE daily_prompts SET body = ? WHERE id = ? RETURNING *'
  ).bind(body.trim(), id).first()

  if (!result) return new Response('Not found', { status: 404 })

  await logEvent(env, {
    event:   'daily_prompt.updated',
    tag:     'innhold',
    actorId: caller.sub,
    meta:    { id, body_preview: body.trim().slice(0, 60) },
  })

  return Response.json(result)
}

export async function onRequestDelete({ env, request, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  await env.DB.prepare('DELETE FROM daily_prompts WHERE id = ?').bind(id).run()

  await logEvent(env, {
    event:   'daily_prompt.deleted',
    tag:     'innhold',
    actorId: caller.sub,
    meta:    { id },
  })

  return new Response(null, { status: 204 })
}
