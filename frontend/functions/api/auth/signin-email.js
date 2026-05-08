import { verifyPassword } from '../../lib/password.js'
import { createWebSession } from '../../lib/session.js'

const INVALID = 'Feil e-post eller passord'

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { email, password } = body ?? {}
  if (!email || !password) return Response.json({ error: INVALID }, { status: 400 })

  const emailNorm = email.trim().toLowerCase()

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(emailNorm).first()
  if (!user) return Response.json({ error: INVALID }, { status: 401 })

  const identity = await env.DB.prepare(
    'SELECT credential FROM identities WHERE user_id = ? AND provider = ?'
  ).bind(user.id, 'email').first()
  if (!identity?.credential) return Response.json({ error: INVALID }, { status: 401 })

  const ok = await verifyPassword(password, identity.credential)
  if (!ok) return Response.json({ error: INVALID }, { status: 401 })

  const { cookie } = await createWebSession(user, env, request)
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookie } })
}
