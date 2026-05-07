import { getSession } from '../lib/auth.js'

export async function onRequestGet({ request, env }) {
  const session = await getSession(request, env)
  if (!session) return new Response('Unauthorized', { status: 401 })

  const { results } = await env.DB.prepare(
    'SELECT * FROM section_cards ORDER BY section, sort_order'
  ).all()

  return Response.json(results)
}
