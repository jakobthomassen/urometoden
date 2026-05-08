export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() }
  catch { return new Response('Invalid JSON', { status: 400 }) }

  const { email } = body ?? {}
  if (!email) return Response.json({ ok: true })  // silent

  const emailNorm = email.trim().toLowerCase()
  const user      = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(emailNorm).first()

  // Always return ok — don't reveal whether the email exists
  if (!user) return Response.json({ ok: true })

  const now      = Date.now()
  const expires  = now + 60 * 60 * 1000  // 1 hour

  // Invalidate old tokens for this user
  await env.DB.prepare(
    'DELETE FROM password_resets WHERE user_id = ?'
  ).bind(user.id).run()

  // Generate secure token (32 random bytes → hex)
  const raw   = crypto.getRandomValues(new Uint8Array(32))
  const token = Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('')

  await env.DB.prepare(
    'INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)'
  ).bind(token, user.id, expires).run()

  const url      = new URL(request.url)
  const resetUrl = `${url.origin}/?reset_token=${token}`

  // Send email via Resend
  if (env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'Uro <noreply@urometoden.no>',
        to:      [emailNorm],
        subject: 'Tilbakestill passordet ditt',
        html:    `
          <p>Du har bedt om å tilbakestille passordet ditt på Uro.</p>
          <p><a href="${resetUrl}" style="font-size:16px;font-weight:600;">Tilbakestill passord</a></p>
          <p>Lenken er gyldig i 1 time. Hvis du ikke ba om dette, kan du ignorere denne e-posten.</p>
          <hr>
          <p style="font-size:12px;color:#888;">urometoden.no</p>
        `,
      }),
    })
  }

  return Response.json({ ok: true })
}
