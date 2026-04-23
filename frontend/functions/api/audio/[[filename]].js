import { getSession } from '../../lib/auth.js'

function parseRange(header) {
  if (!header) return undefined
  const m = /^bytes=(\d*)-(\d*)$/.exec(header)
  if (!m) return undefined
  if (m[1] === '') return { suffix: parseInt(m[2]) }
  const offset = parseInt(m[1])
  if (m[2] === '') return { offset }
  return { offset, length: parseInt(m[2]) - offset + 1 }
}

export async function onRequestGet({ env, request, params }) {
  if (!await getSession(request, env)) return new Response('Unauthorized', { status: 401 })
  if (!env.AUDIO_BUCKET) return new Response('Bucket not configured', { status: 500 })

  const key = params.filename
  if (!key || key.includes('..') || key.startsWith('/')) {
    return new Response('Invalid key', { status: 400 })
  }

  const range = parseRange(request.headers.get('Range'))
  const object = await env.AUDIO_BUCKET.get(key, range ? { range } : {})
  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'audio/mpeg')
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'private, max-age=3600')

  if (object.range) {
    const { offset, length } = object.range
    headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`)
    headers.set('Content-Length', String(length))
    return new Response(object.body, { status: 206, headers })
  }

  headers.set('Content-Length', String(object.size))
  return new Response(object.body, { headers })
}
