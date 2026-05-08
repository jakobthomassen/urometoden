import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import {
  ScrollView, View, Text, StyleSheet,
  TouchableOpacity, Animated,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return 'God morgen'
  if (h >= 11 && h < 17) return 'God dag'
  return 'God kveld'
}

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

const WEEK_TITLES: Record<number, string> = {
  1: 'Møt uroen', 2: 'Reaktivitet', 3: 'Pust og ro', 4: 'Kroppen vet',
  5: 'Mønstre',   6: 'Ressursen',   7: 'Integrasjon', 8: 'Veien videre',
}

export default function HjemScreen() {
  const { colors: C }  = useTheme()
  const { user, token } = useAuth()
  const [tip, setTip]   = useState<string | null>(null)
  const [activeWeek,    setActiveWeek]    = useState<number>(1)
  const [weeksDone,     setWeeksDone]     = useState<number>(0)
  const [progressReady, setProgressReady] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? ''

  useEffect(() => {
    apiFetch('/api/tip', {}, token)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.body) setTip(data.body) })
      .catch(() => {})
  }, [token])

  useFocusEffect(useCallback(() => {
    apiFetch('/api/me/progress', {}, token)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setActiveWeek(data.active_week ?? 1)
        setWeeksDone(Object.values(data.weeks ?? {}).filter((w: any) => w.completed_at).length)
        setProgressReady(true)
      })
      .catch(() => {})
  }, [token]))

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FadeUp delay={0}>
        <Text style={[styles.greeting, { color: C.text }]}>
          {getGreeting()}{firstName ? `, ${firstName}` : ''}
        </Text>
        <Text style={[styles.subtitle, { color: C.mutedText }]}>
          Hva trenger du i dag?
        </Text>
      </FadeUp>

      <FadeUp delay={100}>
        <TouchableOpacity
          style={[styles.journeyCard, { backgroundColor: C.primary, borderColor: C.primarySoft }]}
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)/reise')}
        >
          <View style={styles.cardTopRow}>
            <Text style={[styles.eyebrow, { color: C.white }]}>Uropraksis</Text>
            <View style={styles.circleButton}>
              <Ionicons name="arrow-forward" size={22} color={C.white} />
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: C.white }]}>Din reise</Text>
          {progressReady ? (
            <Text style={[styles.cardDescription, { color: C.white }]}>
              Uke {activeWeek} · {WEEK_TITLES[activeWeek] ?? ''}
              {'\n'}{weeksDone} av 8 uker fullført
            </Text>
          ) : (
            <Text style={[styles.cardDescription, { color: C.white }]}>
              Fortsett der du slapp, i ditt eget tempo.
            </Text>
          )}
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: 'rgba(255,255,255,0.16)' }]}
            activeOpacity={0.9}
            onPress={() => router.push(progressReady ? `/uke/${activeWeek}` as any : '/(tabs)/reise')}
          >
            <Text style={[styles.startButtonText, { color: C.white }]}>Fortsett</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </FadeUp>

      <FadeUp delay={180}>
        <View style={[styles.tipCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.tipEyebrow, { color: C.primary }]}>DAGENS TANKE</Text>
          <Text style={[styles.tipText, { color: C.mutedText }]}>
            {tip ?? '…'}
          </Text>
        </View>
      </FadeUp>

      <FadeUp delay={240}>
        <Text style={[styles.sectionTitle, { color: C.text }]}>Snarveier</Text>
      </FadeUp>

      {[
        { icon: 'headset-outline',  title: 'Lydbibliotek', sub: 'Utforsk lydøkter i eget tempo',   href: '/(tabs)/lydbibliotek' },
        { icon: 'create-outline',   title: 'Refleksjon',   sub: 'Skriv ned det du legger merke til', href: '/reflections' },
        { icon: 'school-outline',   title: 'Uro-skolen',   sub: 'Kunnskap og historier',             href: '/(tabs)/kurs' },
      ].map((item, i) => (
        <FadeUp key={item.href} delay={300 + i * 60}>
          <TouchableOpacity
            style={[styles.linkCard, { backgroundColor: C.card, borderColor: C.border }]}
            activeOpacity={0.9}
            onPress={() => router.push(item.href as any)}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIconBox, { backgroundColor: C.background }]}>
                <Ionicons name={item.icon as any} size={24} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.linkTitle, { color: C.text }]}>{item.title}</Text>
                <Text style={[styles.linkSubtitle, { color: C.mutedText }]}>{item.sub}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={C.mutedText} />
          </TouchableOpacity>
        </FadeUp>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  content:          { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 120 },
  greeting:         { fontSize: 36, fontWeight: '700', marginBottom: 6 },
  subtitle:         { fontSize: 17, marginBottom: 24 },
  journeyCard:      { borderRadius: 28, padding: 22, marginBottom: 18, borderWidth: 1 },
  cardTopRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  eyebrow:          { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  circleButton:     { width: 56, height: 56, borderRadius: 999, borderWidth: 4, borderColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  cardTitle:        { fontSize: 30, fontWeight: '700', marginBottom: 10, maxWidth: '85%' },
  cardDescription:  { fontSize: 16, lineHeight: 24, marginBottom: 18, maxWidth: '90%' },
  startButton:      { alignSelf: 'flex-start', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  startButtonText:  { fontSize: 15, fontWeight: '700' },
  tipCard:          { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 24 },
  tipEyebrow:       { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  tipText:          { fontSize: 16, lineHeight: 25, fontStyle: 'italic' },
  sectionTitle:     { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  linkCard:         { borderRadius: 20, borderWidth: 1, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  linkLeft:         { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  linkIconBox:      { width: 58, height: 58, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  linkTitle:        { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  linkSubtitle:     { fontSize: 14, lineHeight: 20 },
})
