import { requireAdmin } from '../../../lib/auth.js'

const VALID_TYPES = ['audio', 'video', 'case', 'reflect']

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const [{ results: items }, { results: weekRows }] = await Promise.all([
    env.DB.prepare('SELECT id, type, title, meta, r2_key, abstract, body, prompt FROM content_items ORDER BY type, title LIMIT 500').all(),
    env.DB.prepare('SELECT content_id, week_id, position FROM week_content ORDER BY week_id, position').all(),
  ])

  const weeksByItem = {}
  for (const w of weekRows) {
    if (!weeksByItem[w.content_id]) weeksByItem[w.content_id] = []
    weeksByItem[w.content_id].push({ week_id: w.week_id, position: w.position })
  }

  return Response.json(items.map(item => ({ ...item, weeks: weeksByItem[item.id] || [] })))
}

export async function onRequestPost({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const { id, type, title, meta, r2_key, abstract, body, prompt, weeks } = await request.json()

  if (!id?.trim() || !title?.trim()) return new Response('id and title are required', { status: 400 })
  if (!VALID_TYPES.includes(type))   return new Response('Invalid type', { status: 400 })

  try {
    await env.DB.prepare(
      'INSERT INTO content_items (id, type, title, meta, r2_key, abstract, body, prompt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id.trim(), type, title.trim(), meta || null, r2_key || null, abstract || null, body || null, prompt || null).run()
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return new Response('ID already in use', { status: 409 })
    throw e
  }

  const assignedWeeks = []
  if (weeks?.length) {
    for (const w of weeks) {
      await env.DB.prepare('INSERT INTO week_content (week_id, content_id, position) VALUES (?, ?, ?)')
        .bind(w.week_id, id.trim(), w.position ?? 0).run()
      assignedWeeks.push(w)
    }
  }

  const item = await env.DB.prepare('SELECT * FROM content_items WHERE id = ?').bind(id.trim()).first()
  return Response.json({ ...item, weeks: assignedWeeks }, { status: 201 })
}
