import { requireAdmin } from '../../lib/auth.js'

const ALLOWED = /\.(mp3|m4a|aac|ogg|wav|flac|mp4|mov|webm)$/i

export async function onRequestPost({ request, env }) {
  if (!await requireAdmin(request, env)) return new Response('Forbidden', { status: 403 })
  if (!env.AUDIO_BUCKET) return new Response('Bucket not configured', { status: 500 })

  const form = await request.formData()
  const file = form.get('file')
  const key  = form.get('key')?.trim()

  if (!file || !(file instanceof File)) return new Response('Missing file', { status: 400 })
  if (!key || key.includes('..') || key.startsWith('/') || !ALLOWED.test(key)) {
    return new Response('Invalid key', { status: 400 })
  }

  await env.AUDIO_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  })

  return Response.json({ key })
}
