/**
 * Write a single audit log entry.
 * actor_id  — user who performed the action; null for system-generated events
 * target_id — affected user ID; null when not applicable
 * meta      — plain object; serialised to JSON. Use for titles, emails, etc.
 *             that may not be retrievable later (e.g. after a record is deleted).
 */
export async function logEvent(env, { event, tag, actorId = null, targetId = null, meta = null }) {
  await env.DB.prepare(
    'INSERT INTO logs (event, tag, actor_id, target_id, meta, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    event,
    tag,
    actorId  ?? null,
    targetId ?? null,
    meta ? JSON.stringify(meta) : null,
    Date.now(),
  ).run()
}
