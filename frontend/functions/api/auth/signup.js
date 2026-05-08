import { hashPassword } from '../../lib/password.js'
import { createWebSession } from '../../lib/session.js'
import { logEvent } from '../../lib/logger.js'

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { email, password } = body ?? {}
  if (!email || !password) return Response.json({ error: 'Fyll inn e-post og passord' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Passordet må være minst 8 tegn' }, { status: 400 })

  const emailNorm = email.trim().toLowerCase()
  const now       = Date.now()

  const existing = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(emailNorm).first()

  if (existing) {
    const existingIdentity = await env.DB.prepare(
      'SELECT id FROM identities WHERE user_id = ? AND provider = ?'
    ).bind(existing.id, 'email').first()

    if (existingIdentity) {
      return Response.json({ error: 'E-post allerede registrert. Logg inn i stedet.' }, { status: 409 })
    }

    // Google user adding a password — link the credential
    const hash = await hashPassword(password)
    await env.DB.prepare(
      'INSERT INTO identities (user_id, provider, provider_id, credential, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(existing.id, 'email', emailNorm, hash, now).run()

    const { cookie } = await createWebSession(existing, env, request)
    return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookie } })
  }

  // New user
  const hash = await hashPassword(password)
  const name = emailNorm.split('@')[0]

  await env.DB.prepare(
    'INSERT INTO users (email, name, created_at) VALUES (?, ?, ?)'
  ).bind(emailNorm, name, now).run()

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(emailNorm).first()

  await env.DB.prepare(
    'INSERT INTO identities (user_id, provider, provider_id, credential, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, 'email', emailNorm, hash, now).run()

  await logEvent(env, {
    event:    'user.signup',
    tag:      'bruker',
    targetId: user.id,
    meta:     { email: user.email, source: 'web-email' },
  })

  const { cookie } = await createWebSession(user, env, request)
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': cookie } })
}
