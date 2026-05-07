import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

const ALLOWED_FIELDS = ['title', 'event_date', 'type', 'location', 'link', 'description', 'reveal_at']

export async function onRequestPatch({ request, env, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  // Fetch current record for log context before making changes
  const existing = await env.DB.prepare('SELECT title, cancelled FROM events WHERE id = ?').bind(id).first()
  if (!existing) return new Response('Not found', { status: 404 })

  const body = await request.json()
  const now  = Date.now()

  if (body.cancel === true) {
    await env.DB.prepare(
      'UPDATE events SET cancelled = 1, cancelled_at = ?, updated_at = ? WHERE id = ?'
    ).bind(now, now, id).run()

    await logEvent(env, {
      event:   'event.cancelled',
      tag:     'arrangement',
      actorId: caller.sub,
      meta:    { event_id: id, title: existing.title },
    })
  } else if (body.cancel === false) {
    await env.DB.prepare(
      'UPDATE events SET cancelled = 0, cancelled_at = NULL, updated_at = ? WHERE id = ?'
    ).bind(now, id).run()

    await logEvent(env, {
      event:   'event.restored',
      tag:     'arrangement',
      actorId: caller.sub,
      meta:    { event_id: id, title: existing.title },
    })
  }

  const fields = ALLOWED_FIELDS.filter(f => f in body)
  if (fields.length > 0) {
    const sets = fields.map(f => `${f} = ?`).join(', ')
    const vals = fields.map(f => {
      const v = body[f]
      if (v === null || v === '' || v === undefined) return null
      if (f === 'event_date' || f === 'reveal_at') return Number(v)
      return v
    })
    await env.DB.prepare(`UPDATE events SET ${sets}, updated_at = ? WHERE id = ?`)
      .bind(...vals, now, id).run()

    await logEvent(env, {
      event:   'event.updated',
      tag:     'arrangement',
      actorId: caller.sub,
      // Use incoming title if being changed, otherwise fall back to existing
      meta:    { event_id: id, title: body.title?.trim() ?? existing.title },
    })
  }

  const updated = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  if (!updated) return new Response('Not found', { status: 404 })
  return Response.json(updated)
}

export async function onRequestDelete({ request, env, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  // Fetch title before deletion so the log entry is self-contained
  const existing = await env.DB.prepare('SELECT title FROM events WHERE id = ?').bind(id).first()

  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run()

  await logEvent(env, {
    event:   'event.deleted',
    tag:     'arrangement',
    actorId: caller.sub,
    meta:    { event_id: id, title: existing?.title ?? null },
  })

  return Response.json({ ok: true })
}
