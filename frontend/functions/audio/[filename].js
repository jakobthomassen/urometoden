export async function onRequest({ params, env, request }) {
  const object = await env.AUDIO_BUCKET.get(params.filename, {
    range: request.headers,
    onlyIf: request.headers,
  })

  if (!object) return new Response('Not found', { status: 404 })

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', 'public, max-age=3600')

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