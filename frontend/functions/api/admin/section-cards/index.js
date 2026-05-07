import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { results } = await env.DB.prepare(
    'SELECT * FROM section_cards ORDER BY section, sort_order'
  ).all()

  return Response.json(results)
}

export async function onRequestPost({ request, env }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const body = await request.json()
  const { section, icon, title, description, link, link_label, sort_order = 0 } = body

  if (!['fordypning', 'uroskolen'].includes(section)) return new Response('Invalid section', { status: 400 })
  if (!title?.trim()) return new Response('Missing title', { status: 400 })

  const now = Date.now()
  const { meta } = await env.DB.prepare(`
    INSERT INTO section_cards (section, icon, title, description, link, link_label, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    section, icon || 'info', title.trim(),
    description || null, link || null, link_label || null,
    Number(sort_order), now, now,
  ).run()

  const created = await env.DB.prepare('SELECT * FROM section_cards WHERE id = ?').bind(meta.last_row_id).first()

  await logEvent(env, {
    event:   'section_card.created',
    tag:     'arrangement',
    actorId: caller.sub,
    meta:    { title: created.title, section: created.section },
  })

  return Response.json(created, { status: 201 })
}
