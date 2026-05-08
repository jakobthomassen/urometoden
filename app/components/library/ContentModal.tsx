import { Modal, View, Pressable, ScrollView, StyleSheet } from 'react-native'
import Text from '@/components/ui/Text'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/components/ui/ThemeContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import { type ContentItem } from './ContentCard'

const TYPE_LABELS: Record<string, string> = {
  audio:   'Lydfil',
  case:    'Case',
  reflect: 'Refleksjon',
  video:   'Video',
}

const TYPE_COLORS: Record<string, string> = {
  audio:   '#5F8B73',
  case:    '#7B6FAA',
  reflect: '#C0845A',
  video:   '#4A90B8',
}

type Props = {
  item:        ContentItem | null
  onClose:     () => void
  onComplete?: (itemId: string) => void
}

export default function ContentModal({ item, onClose, onComplete }: Props) {
  const { colors: C } = useTheme()
  const { play }       = usePlayer()
  const { token }      = useAuth()

  if (!item) return null

  const typeColor = TYPE_COLORS[item.type] ?? C.primary
  const paragraphs = item.body?.split('\n\n').filter(Boolean) ?? []

  async function handlePlay() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onClose()
    play({
      id:       item.id,
      title:    item.title,
      abstract: item.abstract,
      r2_key:   item.r2_key!,
      meta:     item.meta,
    })
  }

  return (
    <Modal
      visible={!!item}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: C.background }]}>
        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <View style={[styles.badge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>
              {TYPE_LABELS[item.type]}
            </Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={C.mutedText} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: C.text }]}>{item.title}</Text>

          {item.abstract ? (
            <Text style={[styles.abstract, { color: C.mutedText }]}>{item.abstract}</Text>
          ) : null}

          {(item.meta || item.weeks?.length > 0) ? (
            <View style={styles.metaRow}>
              {item.meta ? (
                <Text style={[styles.meta, { color: C.mutedText }]}>{item.meta}</Text>
              ) : null}
              {item.weeks?.map(w => (
                <View key={w} style={[styles.weekChip, { backgroundColor: C.border }]}>
                  <Text style={[styles.weekText, { color: C.mutedText }]}>Uke {w}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {paragraphs.length > 0 ? (
            <>
              <View style={[styles.divider, { backgroundColor: C.border }]} />
              {paragraphs.map((p, i) => (
                <Text key={i} style={[styles.bodyText, { color: C.text }]}>{p}</Text>
              ))}
            </>
          ) : null}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: C.border }]}>
          {item.type === 'audio' && item.r2_key ? (
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: typeColor },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.actionText}>Lytt</Text>
            </Pressable>
          ) : item.type === 'case' ? (
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                apiFetch(`/api/me/progress/${item.id}`, {
                  method: 'PATCH',
                  body:   JSON.stringify({ completed: true }),
                }, token).catch(() => {})
                onComplete?.(item.id)
                onClose()
              }}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: typeColor },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionText}>Lest</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 12,
  },
  abstract: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
  },
  weekChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  weekText: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  pressed: {
    opacity: 0.85,
  },
})
