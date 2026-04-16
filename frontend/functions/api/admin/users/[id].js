import { requireAdmin } from '../../../../lib/auth.js'

const ALLOWED = ['is_admin', 'membership', 'membership_expires_at']

export async function onRequestPatch({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const id   = parseInt(params.id)
  const body = await request.json()

  const fields = Object.keys(body).filter(k => ALLOWED.includes(k))
  if (fields.length === 0) return new Response('No valid fields', { status: 400 })

  const set    = fields.map(k => `${k} = ?`).join(', ')
  const values = fields.map(k => body[k])

  await env.DB.prepare(`UPDATE users SET ${set} WHERE id = ?`)
    .bind(...values, id).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  return Response.json(user)
}
