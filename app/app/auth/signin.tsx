import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'

WebBrowser.maybeCompleteAuthSession()

export default function SignInScreen() {
  const { colors: Colors } = useTheme()
  const auth = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  })

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      handleGoogleToken(response.authentication.accessToken)
    } else if (response?.type === 'error') {
      setError('Google-innlogging feilet. Prøv igjen.')
      setLoading(false)
    }
  }, [response])

  async function handleGoogleToken(accessToken: string) {
    setLoading(true)
    setError(null)
    try {
      await auth.signIn(accessToken)
    } catch {
      setError('Kunne ikke logge inn. Sjekk nettilkoblingen og prøv igjen.')
      setLoading(false)
    }
  }

  function handleGooglePress() {
    setError(null)
    setLoading(true)
    promptAsync()
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors.text }]}>Logg inn</Text>
        <Text style={[styles.subtitle, { color: Colors.mutedText }]}>
          Fortsett reisen din og få tilgang til Uro-portalen.
        </Text>

        <View style={styles.socials}>
          <Pressable
            onPress={handleGooglePress}
            disabled={!request || loading}
            style={({ pressed }) => [
              styles.socialButton,
              { borderColor: Colors.border, backgroundColor: Colors.card },
              pressed && styles.socialButtonPressed,
              (!request || loading) && styles.socialButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            )}
            <Text style={[styles.socialText, { color: Colors.text }]}>
              {loading ? 'Logger inn…' : 'Fortsett med Google'}
            </Text>
          </Pressable>

          {/* TODO: Apple Sign-In — requires expo-apple-authentication + backend /api/auth/native-apple */}
          <Pressable
            disabled
            style={[styles.socialButton, styles.appleButton, styles.socialButtonDisabled]}
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            <Text style={styles.appleText}>Fortsett med Apple</Text>
          </Pressable>
        </View>

        {error && (
          <Text style={[styles.error, { color: '#e05252' }]}>{error}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 32,
  },

  title: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 36,
  },

  socials: {
    gap: 14,
  },

  socialButton: {
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  socialButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  socialButtonDisabled: {
    opacity: 0.45,
  },

  socialText: {
    fontSize: 16,
    fontWeight: '600',
  },

  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },

  appleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  error: {
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
})
