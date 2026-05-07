import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

export async function onRequestDelete({ env, request, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id  = parseInt(params.id)
  const tip = await env.DB.prepare('SELECT body FROM tips WHERE id = ?').bind(id).first()

  await env.DB.prepare('DELETE FROM tips WHERE id = ?').bind(id).run()

  if (tip) {
    await logEvent(env, {
      event:   'tip.deleted',
      tag:     'innhold',
      actorId: caller.sub,
      meta:    { body_preview: tip.body.slice(0, 60) },
    })
  }

  return new Response(null, { status: 204 })
}
