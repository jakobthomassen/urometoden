import { requireAdmin } from '../../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const url     = new URL(request.url)
  const search  = url.searchParams.get('search') || ''
  const page    = Math.max(1, parseInt(url.searchParams.get('page')     || '1'))
  const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') || '10')))
  const offset  = (page - 1) * perPage

  const where = search ? 'WHERE name LIKE ? OR email LIKE ?' : ''
  const binds = search ? [`%${search}%`, `%${search}%`]      : []
  const now   = Date.now()

  const [countRow, memberRow, trialRow, { results }] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS n FROM users ${where}`).bind(...binds).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM users WHERE membership = 'member' AND membership_expires_at > ?`).bind(now).first(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM users WHERE membership = 'trial'  AND membership_expires_at > ?`).bind(now).first(),
    env.DB.prepare(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...binds, perPage, offset).all(),
  ])

  return Response.json({
    results,
    total:       countRow.n,
    memberCount: memberRow.n,
    trialCount:  trialRow.n,
  })
}
