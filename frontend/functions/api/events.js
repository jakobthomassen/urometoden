import { getSession } from '../lib/auth.js'

const HOUR = 3_600_000
const DAY  = 86_400_000

function sanitizeEvent(event, now) {
  const e = { ...event }
  if (e.reveal_at && e.reveal_at > now) {
    e.link     = null
    e.location = null
    e.reveal_pending = true
  }
  return e
}

export async function onRequestGet({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const url     = new URL(request.url)
  const archive = url.searchParams.get('archive') === '1'
  const page    = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const perPage = Math.min(50, Math.max(1, parseInt(url.searchParams.get('per_page') || '10')))
  const now     = Date.now()

  if (archive) {
    const offset = (page - 1) * perPage
    const { results } = await env.DB.prepare(`
      SELECT * FROM events
      WHERE (cancelled = 0 AND event_date < ? - ?)
         OR (cancelled = 1 AND (event_date < ? OR cancelled_at < ? - 3 * ?))
      ORDER BY event_date DESC
      LIMIT ? OFFSET ?
    `).bind(now, HOUR, now, now, DAY, perPage + 1, offset).all()

    const hasMore = results.length > perPage
    return Response.json({
      events:  results.slice(0, perPage).map(e => sanitizeEvent(e, now)),
      hasMore,
      page,
    })
  }

  // Upcoming: normal events within grace, cancelled events still visible
  const { results } = await env.DB.prepare(`
    SELECT * FROM events
    WHERE (cancelled = 0 AND event_date >= ? - ?)
       OR (cancelled = 1 AND event_date > ? AND cancelled_at >= ? - 3 * ?)
    ORDER BY event_date ASC
  `).bind(now, HOUR, now, now, DAY).all()

  return Response.json(results.map(e => sanitizeEvent(e, now)))
}
