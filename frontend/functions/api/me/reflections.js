import { getSession } from '../../lib/auth.js'

export async function onRequestGet({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const { results } = await env.DB.prepare(
    'SELECT item_id, body, updated_at FROM user_reflections WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(payload.sub).all()

  return Response.json(results)
}

export async function onRequestPost({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { text } = body ?? {}
  if (!text?.trim()) return Response.json({ error: 'Tomt innhold' }, { status: 400 })

  const itemId = crypto.randomUUID()
  const now    = Date.now()

  await env.DB.prepare(
    'INSERT INTO user_reflections (user_id, item_id, body, updated_at) VALUES (?, ?, ?, ?)'
  ).bind(payload.sub, itemId, text.trim(), now).run()

  return Response.json({ item_id: itemId, body: text.trim(), updated_at: now })
}
