import { requireAdmin } from '../../../lib/auth.js'

const ALLOWED_FIELDS = ['title', 'event_date', 'type', 'location', 'link', 'description', 'reveal_at']

export async function onRequestPatch({ request, env, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  const body = await request.json()
  const now  = Date.now()

  if (body.cancel === true) {
    await env.DB.prepare(
      'UPDATE events SET cancelled = 1, cancelled_at = ?, updated_at = ? WHERE id = ?'
    ).bind(now, now, id).run()
  } else if (body.cancel === false) {
    await env.DB.prepare(
      'UPDATE events SET cancelled = 0, cancelled_at = NULL, updated_at = ? WHERE id = ?'
    ).bind(now, id).run()
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
  }

  const updated = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(id).first()
  if (!updated) return new Response('Not found', { status: 404 })
  return Response.json(updated)
}

export async function onRequestDelete({ request, env, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
