import { getSession } from '../../lib/auth.js'
import { logEvent } from '../../lib/logger.js'

// TODO: Update the DELETE list below when new user-linked tables are added to the schema.
// Tables with ON DELETE CASCADE (identities) are handled automatically by deleting from users.
// All other user tables must be listed explicitly here.
// NOTE: logs are intentionally NOT deleted — the audit trail must survive account deletion.

export async function onRequestDelete({ request, env }) {
  const payload = await getSession(request, env)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  const userId = payload.sub

  // Fetch name + email before deletion so the log entry is self-contained
  const user = await env.DB.prepare('SELECT name, email FROM users WHERE id = ?').bind(userId).first()

  await logEvent(env, {
    event:    'user.account_deleted',
    tag:      'bruker',
    actorId:  userId,
    targetId: userId,
    meta:     { name: user?.name ?? null, email: user?.email ?? null },
  })

  await env.DB.batch([
    env.DB.prepare('DELETE FROM user_progress      WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM user_reflections   WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM user_week_progress WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM user_state         WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM user_login_days    WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM sessions           WHERE user_id = ?').bind(userId),
    env.DB.prepare('DELETE FROM users              WHERE id = ?').bind(userId),
    // identities cascade automatically from users (ON DELETE CASCADE)
  ])

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    },
  })
}
