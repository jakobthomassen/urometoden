import { requireAdmin } from '../../../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })

  const search = new URL(request.url).searchParams.get('search') || ''

  const { results } = search
    ? await env.DB.prepare(
        'SELECT * FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY created_at DESC'
      ).bind(`%${search}%`, `%${search}%`).all()
    : await env.DB.prepare(
        'SELECT * FROM users ORDER BY created_at DESC'
      ).all()

  return Response.json(results)
}
