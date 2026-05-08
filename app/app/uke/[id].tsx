import { useCallback, useRef, useState } from 'react'
import {
  ScrollView, View, Text, StyleSheet,
  Pressable, ActivityIndicator,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import ContentCard, { ContentItem } from '@/components/library/ContentCard'
import ContentModal from '@/components/library/ContentModal'

const WEEK_TITLES: Record<number, string> = {
  1: 'Møt uroen',
  2: 'Reaktivitet',
  3: 'Pust og ro',
  4: 'Kroppen vet',
  5: 'Mønstre',
  6: 'Ressursen',
  7: 'Integrasjon',
  8: 'Veien videre',
}

type ProgressItem = { completed_at: number | null; position_seconds: number | null; listen_seconds: number | null }

function parseDuration(meta: string | null): number {
  if (!meta) return 0
  const mh = meta.match(/(\d+)m\s*(\d+)s/)
  if (mh) return parseInt(mh[1]) * 60 + parseInt(mh[2])
  const mm = meta.match(/(\d+)m/)
  if (mm) return parseInt(mm[1]) * 60
  return 0
}

export default function UkeScreen() {
  const { id }          = useLocalSearchParams<{ id: string }>()
  const weekId          = parseInt(id ?? '1')
  const { colors: C }   = useTheme()
  const { token }        = useAuth()

  const [items, setItems]         = useState<ContentItem[]>([])
  const [progress, setProgress]   = useState<Record<number, ProgressItem>>({})
  const [loading, setLoading]     = useState(true)
  const [activeItem, setActive]   = useState<ContentItem | null>(null)
  const startedRef                = useRef(false)

  useFocusEffect(useCallback(() => {
    setLoading(true)
    if (!startedRef.current) {
      startedRef.current = true
      apiFetch(`/api/me/weeks/${weekId}/start`, { method: 'POST' }, token).catch(() => {})
    }
    Promise.all([
      apiFetch(`/api/weeks/${weekId}/content`, {}, token).then(r => r.ok ? r.json() : []),
      apiFetch('/api/me/progress', {}, token).then(r => r.ok ? r.json() : null),
    ]).then(([contentItems, progressData]) => {
      setItems(contentItems)
      setProgress(progressData?.progress ?? {})
    }).catch(() => {}).finally(() => setLoading(false))
  }, [weekId, token]))

  const completedCount = items.filter(item => progress[item.id]?.completed_at).length
  const allDone        = items.length > 0 && completedCount === items.length

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={[styles.eyebrow, { color: C.primary }]}>UKE {weekId}</Text>
          <Text style={[styles.headerTitle, { color: C.text }]} numberOfLines={1}>
            {WEEK_TITLES[weekId] ?? ''}
          </Text>
        </View>
        {allDone && (
          <View style={[styles.doneBadge, { backgroundColor: C.primary + '22' }]}>
            <Text style={[styles.doneText, { color: C.primary }]}>Fullført</Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {items.length > 0 && (
            <View style={[styles.progressRow, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.progressLabel, { color: C.mutedText }]}>
                {completedCount} av {items.length} fullført
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
                <View style={[
                  styles.progressFill,
                  { backgroundColor: C.primary, width: `${(completedCount / items.length) * 100}%` },
                ]} />
              </View>
            </View>
          )}

          {items.map(item => {
            const p         = progress[item.id]
            const completed = !!p?.completed_at
            const duration  = parseDuration(item.meta)
            const prog      = duration > 0 && p?.position_seconds
              ? p.position_seconds / duration
              : 0

            return (
              <ContentCard
                key={item.id}
                item={item}
                completed={completed}
                progress={prog}
                onPress={() => setActive(item)}
              />
            )
          })}

          {items.length === 0 && (
            <Text style={[styles.empty, { color: C.mutedText }]}>
              Ingen innhold for denne uken ennå.
            </Text>
          )}
        </ScrollView>
      )}

      <ContentModal
        item={activeItem}
        onClose={() => setActive(null)}
        onComplete={id => setProgress(prev => ({
          ...prev,
          [id]: { ...prev[id], completed_at: Date.now(), position_seconds: prev[id]?.position_seconds ?? null, listen_seconds: prev[id]?.listen_seconds ?? null },
        }))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16, borderBottomWidth: 1, gap: 10 },
  backBtn:        { padding: 4 },
  headerText:     { flex: 1 },
  eyebrow:        { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  headerTitle:    { fontSize: 18, fontWeight: '700' },
  doneBadge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  doneText:       { fontSize: 13, fontWeight: '600' },
  content:        { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },
  progressRow:    { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20, gap: 8 },
  progressLabel:  { fontSize: 13 },
  progressTrack:  { height: 3, borderRadius: 2, overflow: 'hidden' },
  progressFill:   { height: 3, borderRadius: 2 },
  empty:          { textAlign: 'center', marginTop: 60, fontSize: 15 },
})
