export async function onRequestGet({ env, request }) {
  const origin = new URL(request.url).origin
  const redirectUri = `${origin}/api/auth/callback`
  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id:     env.GOOGLE_CLIENT_ID,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
  })

  const headers = new Headers()
  headers.set('Location', `https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  headers.append('Set-Cookie', `oauth_state=${state}; HttpOnly; Path=/; SameSite=Lax; Max-Age=600`)

  return new Response(null, { status: 302, headers })
}
