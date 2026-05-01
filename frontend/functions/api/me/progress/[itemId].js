import { getSession } from '../../../lib/auth.js'

async function checkWeekCompletion(env, userId, itemId, now) {
  const { results: weekRows } = await env.DB.prepare(
    'SELECT DISTINCT week_id FROM week_content WHERE content_id = ?'
  ).bind(itemId).all()

  for (const { week_id } of weekRows) {
    const check = await env.DB.prepare(`
      SELECT COUNT(*) AS total,
             SUM(CASE WHEN up.completed_at IS NOT NULL THEN 1 ELSE 0 END) AS done
      FROM week_content wc
      LEFT JOIN user_progress up ON up.item_id = wc.content_id AND up.user_id = ?
      WHERE wc.week_id = ?
    `).bind(userId, week_id).first()

    if (check && check.total > 0 && check.done === check.total) {
      await env.DB.prepare(`
        INSERT INTO user_week_progress (user_id, week_id, started_at, completed_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, week_id) DO UPDATE SET
          completed_at = CASE WHEN user_week_progress.completed_at IS NULL THEN excluded.completed_at ELSE user_week_progress.completed_at END
      `).bind(userId, week_id, now, now).run()
    }
  }
}

export async function onRequestPatch({ request, env, params }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const userId = payload.sub
  const itemId = params.itemId
  if (!itemId) return new Response('Missing itemId', { status: 400 })

  const body = await request.json()
  const now  = Date.now()

  const current = await env.DB.prepare(
    'SELECT completed_at, position_seconds, listen_seconds FROM user_progress WHERE user_id = ? AND item_id = ?'
  ).bind(userId, itemId).first()

  const newPosition  = body.position_seconds ?? current?.position_seconds ?? 0
  const newListen    = body.listen_seconds   ?? current?.listen_seconds   ?? 0
  const completedAt  = body.completed
    ? (current?.completed_at ?? now)
    : (current?.completed_at ?? null)

  await env.DB.prepare(`
    INSERT INTO user_progress (user_id, item_id, completed_at, position_seconds, listen_seconds, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (user_id, item_id) DO UPDATE SET
      completed_at     = excluded.completed_at,
      position_seconds = excluded.position_seconds,
      listen_seconds   = excluded.listen_seconds,
      updated_at       = excluded.updated_at
  `).bind(userId, itemId, completedAt, newPosition, newListen, now).run()

  if (body.completed && !current?.completed_at) {
    await checkWeekCompletion(env, userId, itemId, now)
  }

  return Response.json({ ok: true })
}
