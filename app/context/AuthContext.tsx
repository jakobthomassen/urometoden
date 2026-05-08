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
  user:                 User | null
  token:                string | null
  isLoading:            boolean
  signIn:               (googleAccessToken: string) => Promise<void>
  signInWithEmail:      (email: string, password: string) => Promise<void>
  signUpWithEmail:      (email: string, password: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  signOut:              () => Promise<void>
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

async function finishSignIn(
  res: Response,
  setToken: (t: string | null) => void,
  setUser:  (u: User | null) => void,
) {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as any).error ?? 'Innlogging feilet')
  }
  const { token: jwt, user: userData } = await res.json()
  await Promise.all([storage.setToken(jwt), storage.setUser(userData)])
  setToken(jwt)
  setUser(userData)
  router.replace('/(tabs)/hjem')
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
    await finishSignIn(res, setToken, setUser)
  }

  async function signInWithEmail(email: string, password: string) {
    const res = await apiFetch('/api/auth/native-email-signin', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    })
    await finishSignIn(res, setToken, setUser)
  }

  async function signUpWithEmail(email: string, password: string) {
    const res = await apiFetch('/api/auth/native-email-signup', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    })
    await finishSignIn(res, setToken, setUser)
  }

  async function requestPasswordReset(email: string) {
    await apiFetch('/api/auth/reset-request', {
      method: 'POST',
      body:   JSON.stringify({ email }),
    })
  }

  async function signOut() {
    await Promise.all([storage.clearToken(), storage.clearUser()])
    setToken(null)
    setUser(null)
    router.replace('/auth/signin')
  }

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      signIn, signInWithEmail, signUpWithEmail, requestPasswordReset, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
