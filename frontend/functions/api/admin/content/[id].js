import { requireAdmin } from '../../../lib/auth.js'

const FIELD_QUERIES = {
  title:    'UPDATE content_items SET title    = ? WHERE id = ?',
  meta:     'UPDATE content_items SET meta     = ? WHERE id = ?',
  r2_key:   'UPDATE content_items SET r2_key   = ? WHERE id = ?',
  abstract: 'UPDATE content_items SET abstract = ? WHERE id = ?',
  body:     'UPDATE content_items SET body     = ? WHERE id = ?',
  prompt:   'UPDATE content_items SET prompt   = ? WHERE id = ?',
}

export async function onRequestPatch({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const payload = await request.json()
  const { weeks, ...fields } = payload

  const cols = Object.keys(fields).filter(k => k in FIELD_QUERIES)
  for (const col of cols) {
    await env.DB.prepare(FIELD_QUERIES[col]).bind(fields[col], params.id).run()
  }

  if (weeks !== undefined) {
    await env.DB.prepare('DELETE FROM week_content WHERE content_id = ?').bind(params.id).run()
    for (const w of weeks) {
      const isDefault = w.is_default ? 1 : 0
      if (isDefault) {
        // Clear any existing default for this week before setting a new one
        await env.DB.prepare('UPDATE week_content SET is_default = 0 WHERE week_id = ?').bind(w.week_id).run()
      }
      await env.DB.prepare('INSERT INTO week_content (week_id, content_id, position, is_default) VALUES (?, ?, ?, ?)')
        .bind(w.week_id, params.id, w.position ?? 0, isDefault).run()
    }
  }

  const item = await env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(params.id).first()
  if (!item) return new Response('Not found', { status: 404 })

  const { results: assignedWeeks } = await env.DB.prepare(
    'SELECT week_id, position, is_default FROM week_content WHERE content_id = ? ORDER BY week_id'
  ).bind(params.id).all()

  return Response.json({ ...item, weeks: assignedWeeks })
}

export async function onRequestDelete({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  await env.DB.prepare('DELETE FROM week_content WHERE content_id = ?').bind(params.id).run()
  await env.DB.prepare('DELETE FROM content_items WHERE id = ?').bind(params.id).run()
  return new Response(null, { status: 204 })
}
