import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type Tab       = 'social' | 'email'
type EmailMode = 'signin' | 'signup' | 'reset'

export default function SignInScreen() {
  const { colors: C } = useTheme()
  const auth          = useAuth()

  const [tab,       setTab]       = useState<Tab>('social')
  const [emailMode, setEmailMode] = useState<EmailMode>('signin')

  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function resetForm() { setError(null); setSuccess(null) }

  function switchTab(t: Tab)         { setTab(t);       resetForm() }
  function switchMode(m: EmailMode)  { setEmailMode(m); resetForm() }

  // ── Google ──────────────────────────────────────────────────────────────
  async function handleGooglePress() {
    resetForm()
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices()
      await GoogleSignin.signIn()
      const { accessToken } = await GoogleSignin.getTokens()
      if (!accessToken) throw new Error('No access token')
      await auth.signIn(accessToken)
    } catch (err: any) {
      if (err.code !== statusCodes.SIGN_IN_CANCELLED) {
        setError('Google-innlogging feilet. Prøv igjen.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Email sign-in ────────────────────────────────────────────────────────
  async function handleEmailSignIn() {
    resetForm()
    if (!email || !password) { setError('Fyll inn e-post og passord'); return }
    setLoading(true)
    try {
      await auth.signInWithEmail(email.trim(), password)
    } catch (err: any) {
      setError(err.message ?? 'Innlogging feilet')
    } finally {
      setLoading(false)
    }
  }

  // ── Email sign-up ────────────────────────────────────────────────────────
  async function handleEmailSignUp() {
    resetForm()
    if (!email || !password) { setError('Fyll inn e-post og passord'); return }
    if (password !== confirmPassword) { setError('Passordene stemmer ikke overens'); return }
    setLoading(true)
    try {
      await auth.signUpWithEmail(email.trim(), password)
    } catch (err: any) {
      setError(err.message ?? 'Registrering feilet')
    } finally {
      setLoading(false)
    }
  }

  // ── Password reset ───────────────────────────────────────────────────────
  async function handleResetRequest() {
    resetForm()
    if (!email) { setError('Skriv inn e-postadressen din'); return }
    setLoading(true)
    try {
      await auth.requestPasswordReset(email.trim())
      setSuccess('Sjekk e-posten din for tilbakestillingslenken.')
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: C.text }]}>Logg inn</Text>
        <Text style={[styles.subtitle, { color: C.mutedText }]}>
          Fortsett reisen din og få tilgang til Uro-portalen.
        </Text>

        {/* Tab switcher */}
        <View style={[styles.tabs, { backgroundColor: C.card, borderColor: C.border }]}>
          <Pressable
            style={[styles.tabBtn, tab === 'social' && { backgroundColor: C.background }]}
            onPress={() => switchTab('social')}
          >
            <Text style={[styles.tabText, { color: tab === 'social' ? C.text : C.mutedText }]}>
              Sosiale
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === 'email' && { backgroundColor: C.background }]}
            onPress={() => switchTab('email')}
          >
            <Text style={[styles.tabText, { color: tab === 'email' ? C.text : C.mutedText }]}>
              E-post
            </Text>
          </Pressable>
        </View>

        {/* ── Social tab ───────────────────────────────────────────────────── */}
        {tab === 'social' && (
          <View style={styles.socials}>
            <Pressable
              onPress={handleGooglePress}
              disabled={loading}
              style={({ pressed }) => [
                styles.socialButton,
                { borderColor: C.border, backgroundColor: C.card },
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <Ionicons name="logo-google" size={20} color="#DB4437" />
              )}
              <Text style={[styles.socialText, { color: C.text }]}>
                {loading ? 'Logger inn…' : 'Fortsett med Google'}
              </Text>
            </Pressable>

            <Pressable disabled style={[styles.socialButton, styles.appleButton, styles.disabled]}>
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              <Text style={styles.appleText}>Fortsett med Apple</Text>
            </Pressable>
          </View>
        )}

        {/* ── Email tab ────────────────────────────────────────────────────── */}
        {tab === 'email' && (
          <View style={styles.emailForm}>

            {/* Sign-in form */}
            {emailMode === 'signin' && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="E-post"
                  placeholderTextColor={C.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="Passord"
                  placeholderTextColor={C.mutedText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="current-password"
                />
                {error   && <Text style={styles.errorText}>{error}</Text>}
                {success && <Text style={styles.successText}>{success}</Text>}
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, { backgroundColor: C.primary }, pressed && styles.pressed, loading && styles.disabled]}
                  onPress={handleEmailSignIn}
                  disabled={loading}
                >
                  <Text style={[styles.submitText, { color: C.white ?? '#fff' }]}>
                    {loading ? 'Logger inn…' : 'Logg inn'}
                  </Text>
                </Pressable>
                <View style={styles.formLinks}>
                  <Pressable onPress={() => switchMode('signup')}>
                    <Text style={[styles.linkText, { color: C.mutedText }]}>Opprett konto</Text>
                  </Pressable>
                  <Pressable onPress={() => switchMode('reset')}>
                    <Text style={[styles.linkText, { color: C.mutedText }]}>Glemt passord?</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* Sign-up form */}
            {emailMode === 'signup' && (
              <>
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="E-post"
                  placeholderTextColor={C.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="Passord (minst 8 tegn)"
                  placeholderTextColor={C.mutedText}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="Bekreft passord"
                  placeholderTextColor={C.mutedText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
                {error   && <Text style={styles.errorText}>{error}</Text>}
                {success && <Text style={styles.successText}>{success}</Text>}
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, { backgroundColor: C.primary }, pressed && styles.pressed, loading && styles.disabled]}
                  onPress={handleEmailSignUp}
                  disabled={loading}
                >
                  <Text style={[styles.submitText, { color: C.white ?? '#fff' }]}>
                    {loading ? 'Oppretter konto…' : 'Opprett konto'}
                  </Text>
                </Pressable>
                <View style={styles.formLinks}>
                  <Pressable onPress={() => switchMode('signin')}>
                    <Text style={[styles.linkText, { color: C.mutedText }]}>Har du konto? Logg inn</Text>
                  </Pressable>
                </View>
              </>
            )}

            {/* Reset request form */}
            {emailMode === 'reset' && (
              <>
                <Text style={[styles.resetHint, { color: C.mutedText }]}>
                  Skriv inn e-postadressen din, så sender vi deg en tilbakestillingslenke.
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
                  placeholder="E-post"
                  placeholderTextColor={C.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
                {error   && <Text style={styles.errorText}>{error}</Text>}
                {success && <Text style={styles.successText}>{success}</Text>}
                <Pressable
                  style={({ pressed }) => [styles.submitBtn, { backgroundColor: C.primary }, pressed && styles.pressed, loading && styles.disabled]}
                  onPress={handleResetRequest}
                  disabled={loading}
                >
                  <Text style={[styles.submitText, { color: C.white ?? '#fff' }]}>
                    {loading ? 'Sender…' : 'Send tilbakestillingslenke'}
                  </Text>
                </Pressable>
                <View style={styles.formLinks}>
                  <Pressable onPress={() => switchMode('signin')}>
                    <Text style={[styles.linkText, { color: C.mutedText }]}>Tilbake til innlogging</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        )}

        {error && tab === 'social' && (
          <Text style={[styles.errorText, { marginTop: 20 }]}>{error}</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  content: {
    paddingHorizontal: 28,
    paddingTop:        110,
    paddingBottom:     40,
  },

  title: {
    fontSize:     40,
    fontWeight:   '700',
    marginBottom: 10,
  },

  subtitle: {
    fontSize:     18,
    lineHeight:   28,
    marginBottom: 28,
  },

  // Tabs
  tabs: {
    flexDirection:  'row',
    borderRadius:   16,
    borderWidth:    1,
    padding:        3,
    marginBottom:   24,
    gap:            2,
  },

  tabBtn: {
    flex:           1,
    paddingVertical: 8,
    borderRadius:   13,
    alignItems:     'center',
  },

  tabText: {
    fontSize:   14,
    fontWeight: '600',
  },

  // Social buttons
  socials: { gap: 14 },

  socialButton: {
    height:          60,
    borderRadius:    20,
    borderWidth:     1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
  },

  pressed:  { opacity: 0.85, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },

  socialText: { fontSize: 16, fontWeight: '600' },

  appleButton: { backgroundColor: '#000', borderColor: '#000' },
  appleText:   { fontSize: 16, fontWeight: '600', color: '#fff' },

  // Email form
  emailForm: { gap: 12 },

  input: {
    height:       54,
    borderRadius: 16,
    borderWidth:  1,
    paddingHorizontal: 16,
    fontSize:     15,
  },

  submitBtn: {
    height:          54,
    borderRadius:    16,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       4,
  },

  submitText: { fontSize: 16, fontWeight: '600' },

  formLinks: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    flexWrap:       'wrap',
    gap:            8,
    marginTop:      4,
  },

  linkText: {
    fontSize:           13,
    textDecorationLine: 'underline',
  },

  resetHint: {
    fontSize:   14,
    lineHeight: 20,
  },

  errorText: {
    fontSize:  13,
    color:     '#e05252',
    textAlign: 'center',
    lineHeight: 18,
  },

  successText: {
    fontSize:  13,
    color:     '#4caf7d',
    textAlign: 'center',
    lineHeight: 18,
  },
})
