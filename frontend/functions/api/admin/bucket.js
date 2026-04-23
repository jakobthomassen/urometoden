import { requireAdmin } from '../../lib/auth.js'

export async function onRequestGet({ env, request }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })
  if (!env.AUDIO_BUCKET) return Response.json([])

  const exclude = new URL(request.url).searchParams.get('exclude') || ''

  const [listed, { results: usedRows }] = await Promise.all([
    env.AUDIO_BUCKET.list(),
    env.DB.prepare('SELECT r2_key FROM content_items WHERE r2_key IS NOT NULL').all(),
  ])

  const usedKeys = new Set(usedRows.map(r => r.r2_key).filter(k => k !== exclude))

  const files = listed.objects.map(o => ({
    key:      o.key,
    size:     o.size,
    uploaded: o.uploaded,
    inUse:    usedKeys.has(o.key),
  }))

  return Response.json(files)
}
