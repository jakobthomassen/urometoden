import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { results } = await env.DB.prepare(
    'SELECT * FROM events ORDER BY event_date DESC LIMIT 500'
  ).all()

  return Response.json(results)
}

export async function onRequestPost({ request, env }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const body = await request.json()
  const { title, event_date, type, location, link, description, reveal_at } = body

  if (!title?.trim())                          return new Response('Missing title',        { status: 400 })
  if (!event_date || !Number.isFinite(Number(event_date))) return new Response('Invalid event_date', { status: 400 })
  if (!['online', 'fysisk'].includes(type))    return new Response('Invalid type',         { status: 400 })

  const now = Date.now()
  const { meta } = await env.DB.prepare(`
    INSERT INTO events (title, event_date, type, location, link, description, reveal_at, cancelled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).bind(
    title.trim(), Number(event_date), type,
    location || null, link || null, description || null,
    reveal_at ? Number(reveal_at) : null,
    now, now,
  ).run()

  const created = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(meta.last_row_id).first()

  await logEvent(env, {
    event:   'event.created',
    tag:     'arrangement',
    actorId: caller.sub,
    meta:    { event_id: created.id, title: created.title },
  })

  return Response.json(created, { status: 201 })
}
