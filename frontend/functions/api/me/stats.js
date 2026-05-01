import { getSession } from '../../lib/auth.js'

function osloDateStr(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Oslo',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date)
}

export async function onRequestGet({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const userId = payload.sub

  const [{ results: loginDays }, totRow, weeksRow] = await Promise.all([
    env.DB.prepare('SELECT day FROM user_login_days WHERE user_id = ? ORDER BY day DESC LIMIT 60').bind(userId).all(),
    env.DB.prepare('SELECT COALESCE(SUM(listen_seconds), 0) AS total FROM user_progress WHERE user_id = ?').bind(userId).first(),
    env.DB.prepare('SELECT COUNT(*) AS cnt FROM user_week_progress WHERE user_id = ? AND completed_at IS NOT NULL').bind(userId).first(),
  ])

  // Compute streak: consecutive days ending on today or yesterday
  const today = osloDateStr(new Date())
  const [ty, tm, td] = today.split('-').map(Number)
  const yesterday = osloDateStr(new Date(Date.UTC(ty, tm - 1, td - 1)))

  let streak = 0
  if (loginDays.length > 0) {
    const days = loginDays.map(r => r.day)
    let cursor = days[0] === today ? today : days[0] === yesterday ? yesterday : null
    if (cursor) {
      for (const day of days) {
        if (day !== cursor) break
        streak++
        const [cy, cm, cd] = cursor.split('-').map(Number)
        cursor = osloDateStr(new Date(Date.UTC(cy, cm - 1, cd - 1)))
      }
    }
  }

  return Response.json({
    streak,
    total_listen_seconds: totRow?.total ?? 0,
    weeks_completed:      weeksRow?.cnt   ?? 0,
  })
}
