import { useEffect, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import { apiFetch } from '@/lib/api'
import ContentCard, { ContentItem } from '@/components/library/ContentCard'

const FILTERS = [
  { label: 'Alle',        value: 'all' },
  { label: 'Lydøkter',   value: 'audio' },
  { label: 'Case',        value: 'case' },
  { label: 'Refleksjon',  value: 'reflect' },
  { label: 'Video',       value: 'video' },
]

const SECTION_LABELS: Record<string, string> = {
  audio:   'Lydøkter',
  case:    'Case',
  reflect: 'Refleksjoner',
  video:   'Video',
}

const TYPE_ORDER = ['audio', 'case', 'reflect', 'video']

function groupByType(items: ContentItem[]) {
  const map: Record<string, ContentItem[]> = {}
  items.forEach(item => {
    if (!map[item.type]) map[item.type] = []
    map[item.type].push(item)
  })
  return TYPE_ORDER
    .filter(t => map[t]?.length)
    .map(t => ({ type: t, label: SECTION_LABELS[t], items: map[t] }))
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity     = useRef(new Animated.Value(0)).current
  const translateY  = useRef(new Animated.Value(16)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 380, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 380, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
}

export default function LydbibliotekScreen() {
  const { colors: C }   = useTheme()
  const { token }        = useAuth()
  const { play, track: playingTrack } = usePlayer()

  const [filter, setFilter]     = useState('all')
  const [sections, setSections] = useState<{ type: string; label: string; items: ContentItem[] }[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const url = filter === 'all' ? '/api/content' : `/api/content?type=${filter}`
    apiFetch(url, {}, token)
      .then(r => r.json())
      .then((items: ContentItem[]) => {
        setSections(
          filter === 'all'
            ? groupByType(items)
            : [{ type: filter, label: SECTION_LABELS[filter] ?? filter, items }]
        )
      })
      .catch(() => setError('Kunne ikke laste innhold.'))
      .finally(() => setLoading(false))
  }, [filter, token])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn delay={0}>
        <Text style={[styles.title, { color: C.text }]}>Lydbibliotek</Text>
        <Text style={[styles.subtitle, { color: C.mutedText }]}>
          Utforsk fritt i ditt eget tempo
        </Text>
      </FadeIn>

      <FadeIn delay={80}>
        <View style={styles.filterRow}>
          {FILTERS.map(f => {
            const active = filter === f.value
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                activeOpacity={0.8}
                style={[
                  styles.chip,
                  { backgroundColor: active ? C.primary : C.card, borderColor: C.border },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? C.white : C.text }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </FadeIn>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={C.primary} />
      ) : error ? (
        <Text style={[styles.error, { color: C.mutedText }]}>{error}</Text>
      ) : (
        <FadeIn delay={160}>
          {sections.map(section => (
            <View key={section.type} style={styles.section}>
              {filter === 'all' && (
                <Text style={[styles.sectionLabel, { color: C.mutedText }]}>
                  {section.label}
                </Text>
              )}
              {section.items.map(item => (
                <ContentCard
                  key={item.id}
                  item={item}
                  completed={false}
                  progress={playingTrack?.id === item.id ? 0 : 0}
                  onPress={() => {
                    if (item.type === 'audio' && item.r2_key) {
                      play({
                        id:       item.id,
                        title:    item.title,
                        abstract: item.abstract,
                        r2_key:   item.r2_key,
                        meta:     item.meta,
                      })
                    }
                  }}
                />
              ))}
            </View>
          ))}
        </FadeIn>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 160,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 17,
    marginBottom: 22,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 60,
  },
  error: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 15,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
})
