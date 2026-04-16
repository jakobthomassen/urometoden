import { verifyJwt, parseCookies } from '../../lib/jwt.js'

export async function onRequestGet({ env, request }) {
  const cookies = parseCookies(request.headers.get('Cookie'))
  const token   = cookies.session
  if (!token) return new Response('Unauthorized', { status: 401 })

  const payload = await verifyJwt(token, env.AUTH_SECRET)
  if (!payload) return new Response('Unauthorized', { status: 401 })

  return Response.json({
    id:       payload.sub,
    email:    payload.email,
    name:     payload.name,
    is_admin: payload.is_admin,
  })
}
