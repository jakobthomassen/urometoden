import { useEffect } from 'react'
import { View } from 'react-native'
import { Stack, useSegments, useRouter } from 'expo-router'
import { ThemeProvider } from '@/components/ui/ThemeContext'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { PlayerProvider } from '@/context/PlayerContext'
import MiniPlayer from '@/components/player/MiniPlayer'
import FullPlayer from '@/components/player/FullPlayer'

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
        <PlayerProvider>
          <AuthGuard />
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
            <MiniPlayer />
            <FullPlayer />
          </View>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
