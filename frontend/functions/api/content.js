import { getSession } from '../lib/auth.js'

export async function onRequest({ request, env }) {
  if (!await getSession(request, env)) return new Response('Unauthorized', { status: 401 })
  if (!env.DB) return Response.json({ error: 'DB binding not configured' }, { status: 500 })

  const type = new URL(request.url).searchParams.get('type')

  const cols = 'ci.id, ci.type, ci.title, ci.meta, ci.r2_key, ci.abstract, ci.body, ci.prompt'

  const { results } = type
    ? await env.DB.prepare(`
        SELECT ${cols}, GROUP_CONCAT(wc.week_id) AS week_ids
        FROM content_items ci
        LEFT JOIN week_content wc ON ci.id = wc.content_id
        WHERE ci.type = ?
        GROUP BY ci.id ORDER BY ci.rowid LIMIT 500
      `).bind(type).all()
    : await env.DB.prepare(`
        SELECT ${cols}, GROUP_CONCAT(wc.week_id) AS week_ids
        FROM content_items ci
        LEFT JOIN week_content wc ON ci.id = wc.content_id
        GROUP BY ci.id ORDER BY ci.type, ci.rowid LIMIT 500
      `).all()

  const items = results.map(({ week_ids, ...r }) => ({
    ...r,
    weeks: week_ids ? week_ids.split(',').map(Number).sort((a, b) => a - b) : [],
  }))

  return Response.json(items, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
