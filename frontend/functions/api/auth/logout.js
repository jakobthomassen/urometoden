export async function onRequestPost() {
  const headers = new Headers()
  headers.set('Location', '/')
  headers.set('Set-Cookie', 'session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0')
  return new Response(null, { status: 302, headers })
}
