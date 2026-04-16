export async function onRequest({ request, env }) {
  if (!env.DB) return Response.json({ error: 'DB binding not configured' }, { status: 500 })

  const type = new URL(request.url).searchParams.get('type')

  const { results } = type
    ? await env.DB.prepare('SELECT * FROM content_items WHERE type = ? ORDER BY rowid')
        .bind(type).all()
    : await env.DB.prepare('SELECT * FROM content_items ORDER BY type, rowid')
        .all()

  return Response.json(results)
}
