import { requireAdmin } from '../../lib/auth.js'

const VALID_TAGS = new Set(['bruker', 'tilgang', 'admin', 'arrangement', 'innhold'])

export async function onRequestGet({ request, env }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const url     = new URL(request.url)
  const rawTag  = url.searchParams.get('tag') || 'all'
  const tag     = VALID_TAGS.has(rawTag) ? rawTag : 'all'
  const page    = Math.max(1, parseInt(url.searchParams.get('page')     || '1'))
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '50')))
  const offset  = (page - 1) * perPage

  const where      = tag === 'all' ? '' : 'WHERE l.tag = ?'
  const whereBinds = tag === 'all' ? [] : [tag]

  const [countRow, { results }] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM logs ${tag === 'all' ? '' : 'WHERE tag = ?'}`)
      .bind(...whereBinds).first(),

    env.DB.prepare(`
      SELECT
        l.*,
        a.name  AS actor_name,
        a.email AS actor_email,
        t.name  AS target_name,
        t.email AS target_email
      FROM logs l
      LEFT JOIN users a ON a.id = l.actor_id
      LEFT JOIN users t ON t.id = l.target_id
      ${where}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...whereBinds, perPage, offset).all(),
  ])

  return Response.json({
    results: results,
    total:   countRow?.n ?? 0,
    page,
  })
}
