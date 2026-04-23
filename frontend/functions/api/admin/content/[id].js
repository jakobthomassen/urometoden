import { requireAdmin } from '../../../lib/auth.js'

const EDITABLE = ['title', 'meta', 'r2_key', 'abstract', 'body', 'prompt']

export async function onRequestPatch({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const payload = await request.json()
  const { weeks, ...fields } = payload

  const cols = Object.keys(fields).filter(k => EDITABLE.includes(k))
  if (cols.length > 0) {
    const set = cols.map(k => `${k} = ?`).join(', ')
    await env.DB.prepare(`UPDATE content_items SET ${set} WHERE id = ?`)
      .bind(...cols.map(k => fields[k]), params.id).run()
  }

  if (weeks !== undefined) {
    await env.DB.prepare('DELETE FROM week_content WHERE content_id = ?').bind(params.id).run()
    for (const w of weeks) {
      await env.DB.prepare('INSERT INTO week_content (week_id, content_id, position) VALUES (?, ?, ?)')
        .bind(w.week_id, params.id, w.position ?? 0).run()
    }
  }

  const item = await env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(params.id).first()
  if (!item) return new Response('Not found', { status: 404 })

  const { results: assignedWeeks } = await env.DB.prepare(
    'SELECT week_id, position FROM week_content WHERE content_id = ? ORDER BY week_id'
  ).bind(params.id).all()

  return Response.json({ ...item, weeks: assignedWeeks })
}

export async function onRequestDelete({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  await env.DB.prepare('DELETE FROM week_content WHERE content_id = ?').bind(params.id).run()
  await env.DB.prepare('DELETE FROM content_items WHERE id = ?').bind(params.id).run()
  return new Response(null, { status: 204 })
}
