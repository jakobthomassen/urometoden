export async function onRequest({ params, env, request }) {
  if (!env.AUDIO_BUCKET) {
    return new Response('R2 binding not configured', { status: 500 })
  }

  const object = await env.AUDIO_BUCKET.get(params.filename, {
    range: request.headers,
    onlyIf: request.headers,
  })

  if (!object) {
    return new Response(`File not found: ${params.filename}`, { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'public, max-age=3600')

  // Fallback if R2 has no Content-Type metadata on the file
  if (!headers.get('Content-Type')) {
    headers.set('Content-Type', 'audio/mpeg')
  }

  if (object.range) {
    const { offset = 0, length } = object.range
    headers.set(
      'Content-Range',
      `bytes ${offset}-${offset + length - 1}/${object.size}`
    )
    return new Response(object.body, { status: 206, headers })
  }

  return new Response(object.body, { headers })
}
