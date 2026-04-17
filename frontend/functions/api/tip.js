import { getSession } from '../lib/auth.js'

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

export async function onRequestGet({ env, request }) {
  if (!await getSession(request, env)) return new Response('Unauthorized', { status: 401 })

  const today = todayUTC()
  const now   = Date.now()

  // Return today's tip if already picked
  const existing = await env.DB.prepare('SELECT * FROM tips WHERE used_date = ?')
    .bind(today).first()
  if (existing) return Response.json({ id: existing.id, body: existing.body })

  // Pick random unused tip
  let tip = await env.DB.prepare(
    'SELECT * FROM tips WHERE used_at IS NULL ORDER BY RANDOM() LIMIT 1'
  ).first()

  if (!tip) {
    // Reset tips outside the 7-day grace window
    await env.DB.prepare('UPDATE tips SET used_at = NULL, used_date = NULL WHERE used_at < ?')
      .bind(now - SEVEN_DAYS).run()

    tip = await env.DB.prepare(
      'SELECT * FROM tips WHERE used_at IS NULL ORDER BY RANDOM() LIMIT 1'
    ).first()
  }

  // All tips within 7-day window — fall back to the oldest used tip
  if (!tip) {
    tip = await env.DB.prepare(
      'SELECT * FROM tips ORDER BY used_at ASC LIMIT 1'
    ).first()
  }

  if (!tip) return new Response('No tips available', { status: 404 })

  await env.DB.prepare('UPDATE tips SET used_at = ?, used_date = ? WHERE id = ?')
    .bind(now, today, tip.id).run()

  return Response.json({ id: tip.id, body: tip.body })
}
