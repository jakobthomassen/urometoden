import { Pressable, View, Text, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/components/ui/ThemeContext'

export type ContentItem = {
  id:       number
  title:    string
  abstract: string | null
  body:     string | null
  prompt:   string | null
  type:     'audio' | 'case' | 'reflect' | 'video'
  meta:     string | null
  r2_key:   string | null
  weeks:    number[]
}

const TYPE_LABELS: Record<string, string> = {
  audio:   'Lyd',
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
  item:       ContentItem
  completed?: boolean
  progress?:  number  // 0–1
  onPress:    () => void
}

export default function ContentCard({ item, completed = false, progress = 0, onPress }: Props) {
  const { colors: C } = useTheme()
  const typeColor = TYPE_COLORS[item.type] ?? C.primary

  async function handlePress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: C.card, borderColor: C.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.badge, { backgroundColor: typeColor + '22' }]}>
        <Text style={[styles.badgeText, { color: typeColor }]}>
          {TYPE_LABELS[item.type]}
        </Text>
      </View>

      <Text style={[styles.title, { color: C.text }]} numberOfLines={2}>
        {item.title}
      </Text>

      {item.abstract ? (
        <Text style={[styles.abstract, { color: C.mutedText }]} numberOfLines={2}>
          {item.abstract}
        </Text>
      ) : null}

      {(item.meta || item.weeks?.length > 0) ? (
        <View style={styles.footer}>
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

      {(item.type === 'audio' || item.type === 'video') && progress > 0 && !completed ? (
        <View style={[styles.progressTrack, { backgroundColor: C.border }]}>
          <View style={[styles.progressFill, { backgroundColor: typeColor, width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
      ) : null}

      {completed ? (
        <View style={[styles.checkWrap, { backgroundColor: typeColor + '22' }]}>
          <Text style={[styles.check, { color: typeColor }]}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  abstract: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  meta: {
    fontSize: 13,
  },
  weekChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  weekText: {
    fontSize: 12,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  checkWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 12,
    fontWeight: '700',
  },
})
