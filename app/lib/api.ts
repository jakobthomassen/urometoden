export const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://urometoden.pages.dev'

export async function apiFetch(
  path: string,
  init: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> ?? {}),
  }
  return fetch(`${BASE}${path}`, { ...init, headers })
}
