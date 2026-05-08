import { useCallback, useState } from 'react'
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import Text from '@/components/ui/Text'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, useFocusEffect } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

type Reflection = { item_id: string; body: string; updated_at: number }

function formatDate(ts: number) {
  const d = new Date(ts)
  return d.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ReflectionsScreen() {
  const { colors: C }   = useTheme()
  const { token }        = useAuth()

  const [consented,     setConsented]     = useState<boolean | null>(null)
  const [reflections,   setReflections]   = useState<Reflection[]>([])
  const [text,          setText]          = useState('')
  const [loading,       setLoading]       = useState(true)
  const [saving,        setSaving]        = useState(false)

  useFocusEffect(useCallback(() => {
    setLoading(true)
    apiFetch('/api/me/progress', {}, token)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setConsented(!!data?.reflection_consent_at)
        if (data?.reflection_consent_at) {
          return apiFetch('/api/me/reflections', {}, token)
            .then(r => r.ok ? r.json() : [])
            .then(setReflections)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token]))

  async function handleConsent() {
    await apiFetch('/api/me/consent', { method: 'POST' }, token)
    setConsented(true)
  }

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const res = await apiFetch('/api/me/reflections', {
        method: 'POST',
        body:   JSON.stringify({ text: trimmed }),
      }, token)
      if (res.ok) {
        const entry = await res.json()
        setReflections(prev => [entry, ...prev])
        setText('')
      }
    } catch {} finally {
      setSaving(false)
    }
  }

  function handleDelete(itemId: string) {
    Alert.alert('Slett refleksjon', 'Er du sikker?', [
      { text: 'Avbryt', style: 'cancel' },
      {
        text: 'Slett', style: 'destructive',
        onPress: async () => {
          setReflections(prev => prev.filter(r => r.item_id !== itemId))
          await apiFetch(`/api/me/reflections/${itemId}`, { method: 'DELETE' }, token).catch(() => {})
        },
      },
    ])
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={C.text} />
        <Text style={[styles.backText, { color: C.text }]}>Tilbake</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Ionicons name="create-outline" size={26} color={C.primary} />
        <Text style={[styles.title, { color: C.text }]}>Refleksjoner</Text>
      </View>

      <Text style={[styles.subtitle, { color: C.mutedText }]}>
        Skriv ned tanker, følelser eller noe du la merke til i dag.
      </Text>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 32 }} />
      ) : consented === false ? (
        <View style={[styles.consentCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <Ionicons name="shield-checkmark-outline" size={28} color={C.primary} style={{ marginBottom: 12 }} />
          <Text style={[styles.consentTitle, { color: C.text }]}>Personvern</Text>
          <Text style={[styles.consentBody, { color: C.mutedText }]}>
            Refleksjoner regnes som helsedata under GDPR artikkel 9. De lagres kun for deg, brukes aldri til andre formål, og kan slettes når som helst.
          </Text>
          <TouchableOpacity
            style={[styles.consentBtn, { backgroundColor: C.primary }]}
            activeOpacity={0.9}
            onPress={handleConsent}
          >
            <Text style={[styles.consentBtnText, { color: C.white }]}>Jeg forstår og godtar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={[styles.input, { backgroundColor: C.card, borderColor: C.border, color: C.text }]}
            placeholder="Hva legger du merke til?"
            placeholderTextColor={C.mutedText}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: C.primary }, (saving || !text.trim()) && styles.buttonDisabled]}
            activeOpacity={0.9}
            onPress={handleSave}
            disabled={saving || !text.trim()}
          >
            {saving
              ? <ActivityIndicator size="small" color={C.white} />
              : <Text style={[styles.buttonText, { color: C.white }]}>Lagre refleksjon</Text>
            }
          </TouchableOpacity>

          <View style={styles.list}>
            {reflections.length === 0 ? (
              <Text style={[styles.emptyText, { color: C.mutedText }]}>Ingen refleksjoner enda.</Text>
            ) : (
              reflections.map(item => (
                <View key={item.item_id} style={[styles.reflectionCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={styles.reflectionHeader}>
                    <Text style={[styles.reflectionDate, { color: C.mutedText }]}>
                      {formatDate(item.updated_at)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.item_id)} hitSlop={12}>
                      <Ionicons name="trash-outline" size={18} color={C.mutedText} />
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.reflectionText, { color: C.text }]}>{item.body}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:         { flex: 1 },
  content:           { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 120 },
  backButton:        { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 24 },
  backText:          { fontSize: 16, fontWeight: '600' },
  header:            { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title:             { fontSize: 32, fontWeight: '700' },
  subtitle:          { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  input:             { minHeight: 180, borderRadius: 20, borderWidth: 1, padding: 16, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  button:            { minHeight: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  buttonDisabled:    { opacity: 0.5 },
  buttonText:        { fontSize: 16, fontWeight: '700' },
  list:              { gap: 12 },
  emptyText:         { textAlign: 'center', marginTop: 10, fontSize: 15 },
  reflectionCard:    { borderRadius: 20, borderWidth: 1, padding: 16 },
  reflectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reflectionDate:    { fontSize: 13 },
  reflectionText:    { fontSize: 15, lineHeight: 22 },
  consentCard:       { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 8 },
  consentTitle:      { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  consentBody:       { fontSize: 14, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  consentBtn:        { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  consentBtnText:    { fontSize: 15, fontWeight: '700' },
})
