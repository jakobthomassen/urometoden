import { getSession } from '../../lib/auth.js'

export async function onRequestGet({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const userId = payload.sub

  const [{ results: progressRows }, { results: reflectionRows }, { results: weekRows }, stateRow] = await Promise.all([
    env.DB.prepare('SELECT item_id, completed_at, position_seconds, listen_seconds FROM user_progress WHERE user_id = ?').bind(userId).all(),
    env.DB.prepare('SELECT item_id, body FROM user_reflections WHERE user_id = ?').bind(userId).all(),
    env.DB.prepare('SELECT week_id, started_at, completed_at FROM user_week_progress WHERE user_id = ?').bind(userId).all(),
    env.DB.prepare('SELECT active_week FROM user_state WHERE user_id = ?').bind(userId).first(),
  ])

  const progress = {}
  for (const r of progressRows) {
    progress[r.item_id] = {
      completed_at:     r.completed_at,
      position_seconds: r.position_seconds,
      listen_seconds:   r.listen_seconds,
    }
  }

  const reflections = {}
  for (const r of reflectionRows) {
    reflections[r.item_id] = r.body
  }

  const weeks = {}
  for (const r of weekRows) {
    weeks[r.week_id] = { started_at: r.started_at, completed_at: r.completed_at }
  }

  return Response.json({
    progress,
    reflections,
    weeks,
    active_week: stateRow?.active_week ?? 1,
  })
}
