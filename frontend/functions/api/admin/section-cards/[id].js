import { requireAdmin } from '../../../lib/auth.js'
import { logEvent } from '../../../lib/logger.js'

const PATCHABLE = new Set(['section', 'icon', 'title', 'description', 'link', 'link_label', 'sort_order'])

export async function onRequestPatch({ request, env, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!id) return new Response('Bad Request', { status: 400 })

  const body = await request.json()
  if (body.section && !['fordypning', 'uroskolen'].includes(body.section)) {
    return new Response('Invalid section', { status: 400 })
  }

  const fields = []
  const binds  = []
  for (const [key, val] of Object.entries(body)) {
    if (PATCHABLE.has(key)) {
      fields.push(`${key} = ?`)
      binds.push(val)
    }
  }
  if (!fields.length) return new Response('Bad Request', { status: 400 })

  fields.push('updated_at = ?')
  binds.push(Date.now(), id)

  await env.DB.prepare(`UPDATE section_cards SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run()

  const updated = await env.DB.prepare('SELECT * FROM section_cards WHERE id = ?').bind(id).first()

  await logEvent(env, {
    event:   'section_card.updated',
    tag:     'arrangement',
    actorId: caller.sub,
    meta:    { title: updated?.title, section: updated?.section },
  })

  return Response.json(updated)
}

export async function onRequestDelete({ request, env, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!id) return new Response('Bad Request', { status: 400 })

  const card = await env.DB.prepare('SELECT * FROM section_cards WHERE id = ?').bind(id).first()
  if (!card) return new Response('Not Found', { status: 404 })

  await env.DB.prepare('DELETE FROM section_cards WHERE id = ?').bind(id).run()

  await logEvent(env, {
    event:   'section_card.deleted',
    tag:     'arrangement',
    actorId: caller.sub,
    meta:    { title: card.title, section: card.section },
  })

  return new Response(null, { status: 204 })
}
