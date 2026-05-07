import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  scopes: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ],
})

export default function SignInScreen() {
  const { colors: Colors } = useTheme()
  const auth = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleGooglePress() {
    setError(null)
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices()
      const signInResult = await GoogleSignin.signIn()
      console.log('signIn result:', JSON.stringify(signInResult))
      const tokens = await GoogleSignin.getTokens()
      console.log('tokens:', JSON.stringify(tokens))
      const { accessToken } = tokens
      if (!accessToken) throw new Error('No access token')
      await auth.signIn(accessToken)
    } catch (err: any) {
      console.log('Google sign-in error code:', err.code)
      console.log('Google sign-in error:', JSON.stringify(err))
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else {
        setError('Google-innlogging feilet. Prøv igjen.')
      }
      setLoading(false)
    }
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
            disabled={loading}
            style={({ pressed }) => [
              styles.socialButton,
              { borderColor: Colors.border, backgroundColor: Colors.card },
              pressed && styles.socialButtonPressed,
              loading && styles.socialButtonDisabled,
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
