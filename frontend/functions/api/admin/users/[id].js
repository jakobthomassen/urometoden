import { requireAdmin } from '../../../lib/auth.js'

const ALLOWED      = ['is_admin', 'membership', 'membership_expires_at']
const MEMBERSHIPS  = ['none', 'trial', 'member']

export async function onRequestPatch({ env, request, params }) {
  const caller = await requireAdmin(request, env)
  if (!caller) return new Response('Forbidden', { status: 403 })

  const id = parseInt(params.id)
  if (!Number.isFinite(id)) return new Response('Invalid id', { status: 400 })

  const body   = await request.json()
  const fields = Object.keys(body).filter(k => ALLOWED.includes(k))
  if (fields.length === 0) return new Response('No valid fields', { status: 400 })

  // Prevent admins from modifying their own admin flag
  if (id === caller.sub && fields.includes('is_admin')) {
    return new Response('Cannot modify your own admin status', { status: 403 })
  }

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

  const sets   = fields.map(k => `${k} = ?`)
  const values = fields.map(k => body[k])

  // Auto-set has_used_trial whenever a trial is granted
  if (body.membership === 'trial') {
    sets.push('has_used_trial = 1')
  }

  await env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values, id).run()

  const user = await env.DB.prepare(
    'SELECT id, email, name, display_name, is_admin, membership, membership_expires_at, has_used_trial FROM users WHERE id = ?'
  ).bind(id).first()
  return Response.json(user)
}
