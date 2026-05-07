import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { results } = await env.DB.prepare(
    'SELECT * FROM tips ORDER BY used_at DESC NULLS LAST, id DESC'
  ).all()

  return Response.json(results)
}

export async function onRequestPost({ env, request }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const { body } = await request.json()
  if (!body?.trim()) return new Response('Body required', { status: 400 })

  const result = await env.DB.prepare(
    'INSERT INTO tips (body) VALUES (?) RETURNING *'
  ).bind(body.trim()).first()

  await logEvent(env, {
    event:   'tip.created',
    tag:     'innhold',
    actorId: caller.sub,
    meta:    { body_preview: body.trim().slice(0, 60) },
  })

  return Response.json(result, { status: 201 })
}
