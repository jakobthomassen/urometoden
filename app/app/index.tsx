import { Redirect } from 'expo-router'
import { useAuth } from '@/context/AuthContext'

export default function Index() {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user) return <Redirect href="/(tabs)/hjem" />
  return <Redirect href="/onboarding" />
}
