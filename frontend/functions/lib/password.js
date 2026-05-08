const enc = new TextEncoder()

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    key, 256
  )
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
  return `${b64(salt)}:${b64(bits)}`
}

export async function verifyPassword(password, stored) {
  const [saltB64, hashB64] = stored.split(':')
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const key  = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    key, 256
  )
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)))
  return b64(bits) === hashB64
}
