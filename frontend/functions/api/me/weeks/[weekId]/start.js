import { getSession, requireAdmin } from '../../../../lib/auth.js'

export async function onRequestPost({ request, env, params }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const weekId = parseInt(params.weekId)
  if (!Number.isFinite(weekId) || weekId < 1 || weekId > 8) {
    return new Response('Invalid week', { status: 400 })
  }

  const userId = payload.sub
  const now    = Date.now()

  // Check for dev unlock (admin only) — sets started_at to 6 days ago and marks week complete
  const url   = new URL(request.url)
  const isDev = url.searchParams.get('unlock') === 'dev'
  if (isDev) {
    const adminPayload = await requireAdmin(request, env)
    if (!adminPayload) return new Response('Forbidden', { status: 403 })

    const sixDaysAgo = now - 6 * 86_400_000
    await env.DB.prepare(`
      INSERT INTO user_week_progress (user_id, week_id, started_at, completed_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, week_id) DO UPDATE SET
        started_at   = excluded.started_at,
        completed_at = COALESCE(user_week_progress.completed_at, excluded.completed_at)
    `).bind(userId, weekId, sixDaysAgo, now).run()

    await env.DB.prepare(`
      INSERT INTO user_state (user_id, active_week) VALUES (?, ?)
      ON CONFLICT (user_id) DO UPDATE SET active_week = excluded.active_week
    `).bind(userId, weekId).run()

    return Response.json({ ok: true })
  }

  // Normal start: insert if not already started
  await env.DB.prepare(`
    INSERT INTO user_week_progress (user_id, week_id, started_at)
    VALUES (?, ?, ?)
    ON CONFLICT (user_id, week_id) DO NOTHING
  `).bind(userId, weekId, now).run()

  // Update active week
  await env.DB.prepare(`
    INSERT INTO user_state (user_id, active_week) VALUES (?, ?)
    ON CONFLICT (user_id) DO UPDATE SET active_week = excluded.active_week
  `).bind(userId, weekId).run()

  return Response.json({ ok: true })
}
