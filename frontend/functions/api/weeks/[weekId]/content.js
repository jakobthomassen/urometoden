export async function onRequest({ params, env }) {
  if (!env.DB) return Response.json({ error: 'DB binding not configured' }, { status: 500 })

  const { results } = await env.DB.prepare(`
    SELECT ci.*, COALESCE(wc.meta, ci.meta) AS meta
    FROM content_items ci
    JOIN week_content wc ON ci.id = wc.content_id
    WHERE wc.week_id = ?
    ORDER BY wc.position
  `).bind(parseInt(params.weekId)).all()

  return Response.json(results)
}
