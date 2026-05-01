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

  const { body: text } = await request.json()
  if (typeof text !== 'string') return new Response('body must be a string', { status: 400 })

  const now = Date.now()

  await env.DB.prepare(`
    INSERT INTO user_reflections (user_id, item_id, body, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (user_id, item_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at
  `).bind(userId, itemId, text, now).run()

  // Saving a reflection = completing it
  const current = await env.DB.prepare(
    'SELECT completed_at FROM user_progress WHERE user_id = ? AND item_id = ?'
  ).bind(userId, itemId).first()

  const wasCompleted = !!current?.completed_at

  await env.DB.prepare(`
    INSERT INTO user_progress (user_id, item_id, completed_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (user_id, item_id) DO UPDATE SET
      completed_at = CASE WHEN user_progress.completed_at IS NULL THEN excluded.completed_at ELSE user_progress.completed_at END,
      updated_at   = excluded.updated_at
  `).bind(userId, itemId, now, now).run()

  if (!wasCompleted) {
    await checkWeekCompletion(env, userId, itemId, now)
  }

  return Response.json({ ok: true })
}
