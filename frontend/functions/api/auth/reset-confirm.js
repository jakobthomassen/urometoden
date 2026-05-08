import { hashPassword } from '../../lib/password.js'

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { token, password } = body ?? {}
  if (!token || !password) return Response.json({ error: 'Ugyldig forespørsel' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Passordet må være minst 8 tegn' }, { status: 400 })

  const now = Date.now()

  const reset = await env.DB.prepare(
    'SELECT user_id, expires_at, used_at FROM password_resets WHERE token = ?'
  ).bind(token).first()

  if (!reset)           return Response.json({ error: 'Ugyldig eller utløpt lenke' }, { status: 400 })
  if (reset.used_at)    return Response.json({ error: 'Lenken er allerede brukt' },   { status: 400 })
  if (reset.expires_at < now) return Response.json({ error: 'Lenken har utløpt' },    { status: 400 })

  const hash = await hashPassword(password)

  // Upsert email identity — create if first password for this user
  const existing = await env.DB.prepare(
    'SELECT id FROM identities WHERE user_id = ? AND provider = ?'
  ).bind(reset.user_id, 'email').first()

  if (existing) {
    await env.DB.prepare(
      'UPDATE identities SET credential = ? WHERE user_id = ? AND provider = ?'
    ).bind(hash, reset.user_id, 'email').run()
  } else {
    const user = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(reset.user_id).first()
    await env.DB.prepare(
      'INSERT INTO identities (user_id, provider, provider_id, credential, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(reset.user_id, 'email', user.email, hash, now).run()
  }

  await env.DB.prepare(
    'UPDATE password_resets SET used_at = ? WHERE token = ?'
  ).bind(now, token).run()

  return Response.json({ ok: true })
}
