import { useEffect } from 'react'
import { Stack, useSegments, useRouter } from 'expo-router'
import { ThemeProvider } from '@/components/ui/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'

function AuthGuard() {
  const { user, isLoading } = useAuth()
  const segments = useSegments()
  const router   = useRouter()

  useEffect(() => {
    if (isLoading) return
    const inTabs = segments[0] === '(tabs)'
    if (!user && inTabs) router.replace('/onboarding')
  }, [user, isLoading, segments])

  return null
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthGuard />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  )
}
