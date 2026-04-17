import { requireAdmin } from '../../../lib/auth.js'

export async function onRequestDelete({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  await env.DB.prepare('DELETE FROM tips WHERE id = ?').bind(parseInt(params.id)).run()
  return new Response(null, { status: 204 })
}
