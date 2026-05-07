import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { router } from 'expo-router'
import { apiFetch } from '@/lib/api'
import { storage } from '@/lib/storage'

export type User = {
  id:                    number
  name:                  string
  email:                 string
  membership:            string
  membership_expires_at: number | null
  has_used_trial:        number
  is_admin:              number
}

type AuthContextType = {
  user:      User | null
  token:     string | null
  isLoading: boolean
  signIn:    (googleAccessToken: string) => Promise<void>
  signOut:   () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [token, setToken]       = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restore() {
      const [storedToken, storedUser] = await Promise.all([
        storage.getToken(),
        storage.getUser(),
      ])
      if (storedToken && storedUser && !isTokenExpired(storedToken)) {
        setToken(storedToken)
        setUser(storedUser)
      } else {
        await Promise.all([storage.clearToken(), storage.clearUser()])
      }
      setIsLoading(false)
    }
    restore()
  }, [])

  async function signIn(googleAccessToken: string) {
    const res = await apiFetch('/api/auth/native', {
      method: 'POST',
      body:   JSON.stringify({ access_token: googleAccessToken }),
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => 'Sign-in failed')
      throw new Error(msg)
    }
    const { token: jwt, user: userData } = await res.json()
    await Promise.all([storage.setToken(jwt), storage.setUser(userData)])
    setToken(jwt)
    setUser(userData)
    router.replace('/(tabs)/hjem')
  }

  async function signOut() {
    await Promise.all([storage.clearToken(), storage.clearUser()])
    setToken(null)
    setUser(null)
    router.replace('/auth/signin')
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
