import { getSession } from '../../../lib/auth.js'

export async function onRequest({ params, env, request }) {
  if (!await getSession(request, env)) return new Response('Unauthorized', { status: 401 })
  if (!env.DB) return Response.json({ error: 'DB binding not configured' }, { status: 500 })

  const weekId = parseInt(params.weekId)
  if (!Number.isFinite(weekId) || weekId < 1 || weekId > 8) {
    return new Response('Invalid week', { status: 400 })
  }

  const { results } = await env.DB.prepare(`
    SELECT ci.*, COALESCE(wc.meta, ci.meta) AS meta, wc.is_default
    FROM content_items ci
    JOIN week_content wc ON ci.id = wc.content_id
    WHERE wc.week_id = ?
    ORDER BY wc.position
  `).bind(weekId).all()

  return Response.json(results, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
