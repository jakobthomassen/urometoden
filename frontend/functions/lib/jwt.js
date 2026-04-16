const enc = new TextEncoder()

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64urlDecodeStr(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

async function getKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signJwt(payload, secret, expiresIn = 60 * 60 * 24 * 30) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const full = { ...payload, iat: now, exp: now + expiresIn }
  const h = b64url(enc.encode(JSON.stringify(header)))
  const p = b64url(enc.encode(JSON.stringify(full)))
  const key = await getKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${h}.${p}`))
  return `${h}.${p}.${b64url(sig)}`
}

export async function verifyJwt(token, secret) {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [h, p, s] = parts
  const key = await getKey(secret)
  const sigBuf = Uint8Array.from(
    atob(s.replace(/-/g, '+').replace(/_/g, '/')),
    c => c.charCodeAt(0)
  )
  const valid = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(`${h}.${p}`))
  if (!valid) return null
  const payload = JSON.parse(b64urlDecodeStr(p))
  if (payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';')
      .map(c => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k.trim(), v.join('=')])
  )
}
