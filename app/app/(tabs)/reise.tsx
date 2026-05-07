import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity, Animated, ActivityIndicator,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, useFocusEffect } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

const WEEKS = [
  { week: 1, title: 'Møt uroen',    description: 'Bli kjent med din indre uro. Forstå hva den er, og hvorfor den ikke er farlig.' },
  { week: 2, title: 'Reaktivitet',  description: 'Lær å gjenkjenne dine automatiske reaksjonsmønstre og hva som trigger dem.' },
  { week: 3, title: 'Pust og ro',   description: 'Pusten er ditt raskeste verktøy for å regulere nervesystemet.' },
  { week: 4, title: 'Kroppen vet',  description: 'Kroppen registrerer uro lenge før tankene gjør det. Lær å lytte til disse signalene.' },
  { week: 5, title: 'Mønstre',      description: 'Se de dypere mønstrene bak uroen din – og begynn å løsne dem forsiktig.' },
  { week: 6, title: 'Ressursen',    description: 'Uro inneholder energi. Denne uken lærer du å bruke den konstruktivt.' },
  { week: 7, title: 'Integrasjon',  description: 'Sett sammen det du har lært til en personlig praksis du faktisk kan holde.' },
  { week: 8, title: 'Veien videre', description: 'Avslutt reisen med et blikk tilbake og et tydelig steg videre.' },
]

type WeekProgress = { started_at: number | null; completed_at: number | null }

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(18)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
}

export default function ReiseScreen() {
  const { colors: C }   = useTheme()
  const { token }        = useAuth()
  const [weeks, setWeeks]       = useState<Record<number, WeekProgress>>({})
  const [activeWeek, setActive] = useState(1)
  const [loading, setLoading]   = useState(true)

  useFocusEffect(useCallback(() => {
    apiFetch('/api/me/progress', {}, token)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setWeeks(data.weeks ?? {})
        setActive(data.active_week ?? 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token]))

  const completedCount = Object.values(weeks).filter(w => w.completed_at).length
  const progressPct    = completedCount / 8

  function getStatus(weekNum: number) {
    const w = weeks[weekNum]
    if (w?.completed_at)  return 'completed'
    if (w?.started_at)    return 'current'
    if (weekNum === 1)    return 'current'
    const prev = weeks[weekNum - 1]
    if (prev?.completed_at) return 'current'
    return 'locked'
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FadeUp delay={0}>
        <Text style={[styles.title, { color: C.text }]}>Uropraksis</Text>
        <Text style={[styles.subtitle, { color: C.mutedText }]}>8 uker mot mer ro</Text>
      </FadeUp>

      <FadeUp delay={80}>
        <View style={styles.progressHeader}>
          <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
            <Animated.View style={[styles.progressFill, { backgroundColor: C.primary, width: `${progressPct * 100}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: C.mutedText }]}>
            {loading ? '…' : `${completedCount} av 8 uker fullført`}
          </Text>
        </View>
      </FadeUp>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.timelineList}>
          {WEEKS.map((item, index) => {
            const status  = getStatus(item.week)
            const locked  = status === 'locked'
            const done    = status === 'completed'
            const active  = !locked && !done

            return (
              <FadeUp key={item.week} delay={140 + index * 50}>
                <TouchableOpacity
                  activeOpacity={locked ? 1 : 0.8}
                  disabled={locked}
                  style={styles.weekRow}
                  onPress={() => router.push(`/uke/${item.week}` as any)}
                >
                  <View style={styles.timelineWrap}>
                    <View style={[
                      styles.marker,
                      {
                        borderColor:     done ? C.primary : active ? C.primary : C.border,
                        backgroundColor: done ? C.primary : active ? C.card : C.background,
                      },
                    ]}>
                      {done
                        ? <Ionicons name="checkmark" size={14} color="#fff" />
                        : locked
                        ? <Ionicons name="lock-closed-outline" size={14} color={C.mutedText} />
                        : <Text style={[styles.markerText, { color: C.primary }]}>{item.week}</Text>
                      }
                    </View>
                    {index < WEEKS.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: done ? C.primary : C.border }]} />
                    )}
                  </View>

                  <View style={styles.weekContent}>
                    <Text style={[styles.weekEyebrow, { color: active || done ? C.primary : C.mutedText }]}>
                      UKE {item.week}
                    </Text>
                    <Text style={[styles.weekTitle, { color: locked ? C.mutedText : C.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.weekDescription, { color: C.mutedText }]}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              </FadeUp>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 120 },
  title:           { fontSize: 40, fontWeight: '700', marginBottom: 8 },
  subtitle:        { fontSize: 17, marginBottom: 22 },
  progressHeader:  { marginBottom: 26 },
  progressTrack:   { height: 3, borderRadius: 999, marginBottom: 8, overflow: 'hidden' },
  progressFill:    { height: 3, borderRadius: 999 },
  progressText:    { fontSize: 13, textAlign: 'right' },
  timelineList:    { gap: 0 },
  weekRow:         { flexDirection: 'row', alignItems: 'flex-start', minHeight: 92 },
  timelineWrap:    { width: 30, alignItems: 'center', marginRight: 14 },
  marker:          { width: 30, height: 30, borderRadius: 999, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  markerText:      { fontSize: 14, fontWeight: '700' },
  timelineLine:    { width: 1.5, flex: 1, marginTop: 4, minHeight: 34 },
  weekContent:     { flex: 1, paddingBottom: 26 },
  weekEyebrow:     { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  weekTitle:       { fontSize: 17, fontWeight: '500', marginBottom: 6 },
  weekDescription: { fontSize: 15, lineHeight: 22 },
})
