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

  // Self-healing: if all items in this week are complete but completed_at was never written,
  // set it now (handles D1 replication lag or missed checkWeekCompletion calls)
  const check = await env.DB.prepare(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN up.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS done
    FROM week_content wc
    LEFT JOIN user_progress up ON up.item_id = wc.content_id AND up.user_id = ?
    WHERE wc.week_id = ?
  `).bind(userId, weekId).first()

  if (check && check.total > 0 && check.done >= check.total) {
    await env.DB.prepare(`
      INSERT INTO user_week_progress (user_id, week_id, started_at, completed_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, week_id) DO UPDATE SET
        completed_at = CASE WHEN user_week_progress.completed_at IS NULL THEN excluded.completed_at ELSE user_week_progress.completed_at END
    `).bind(userId, weekId, now, now).run()
  }

  // Return current week state so the frontend can update without a separate fetch
  const row = await env.DB.prepare(
    'SELECT started_at, completed_at FROM user_week_progress WHERE user_id = ? AND week_id = ?'
  ).bind(userId, weekId).first()

  return Response.json({ ok: true, week: { started_at: row?.started_at ?? now, completed_at: row?.completed_at ?? null } })
}
