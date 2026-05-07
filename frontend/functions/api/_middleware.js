const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age':       '86400',
}

export async function onRequest({ request, next }) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const response = await next()
  const out      = new Response(response.body, response)
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    out.headers.set(key, value)
  }
  return out
}
