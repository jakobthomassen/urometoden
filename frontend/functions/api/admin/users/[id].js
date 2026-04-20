import { requireAdmin } from '../../../lib/auth.js'

const ALLOWED      = ['is_admin', 'membership', 'membership_expires_at']
const MEMBERSHIPS  = ['none', 'trial', 'member']

export async function onRequestPatch({ env, request, params }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  const body   = await request.json()
  const fields = Object.keys(body).filter(k => ALLOWED.includes(k))
  if (fields.length === 0) return new Response('No valid fields', { status: 400 })

  // Validate each field value
  for (const k of fields) {
    const v = body[k]
    if (k === 'is_admin' && v !== 0 && v !== 1)
      return new Response('is_admin must be 0 or 1', { status: 400 })
    if (k === 'membership' && !MEMBERSHIPS.includes(v))
      return new Response('Invalid membership value', { status: 400 })
    if (k === 'membership_expires_at' && v !== null && (!Number.isFinite(v) || v < 0))
      return new Response('membership_expires_at must be null or a positive integer', { status: 400 })
  }

  const set    = fields.map(k => `${k} = ?`).join(', ')
  const values = fields.map(k => body[k])

  await env.DB.prepare(`UPDATE users SET ${set} WHERE id = ?`)
    .bind(...values, id).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
  return Response.json(user)
}
