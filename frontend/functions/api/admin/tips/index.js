import { requireAdmin } from '../../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { results } = await env.DB.prepare(
    'SELECT * FROM tips ORDER BY used_at DESC NULLS LAST, id DESC'
  ).all()

  return Response.json(results)
}

export async function onRequestPost({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { body } = await request.json()
  if (!body?.trim()) return new Response('Body required', { status: 400 })

  const result = await env.DB.prepare(
    'INSERT INTO tips (body) VALUES (?) RETURNING *'
  ).bind(body.trim()).first()

  return Response.json(result, { status: 201 })
}
