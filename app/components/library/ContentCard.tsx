import { Pressable, View, StyleSheet } from 'react-native'
import Text from '@/components/ui/Text'
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

const TYPE_COLORS_LIGHT: Record<string, string> = {
  audio:   '#3A6EA5',
  case:    '#7B5EA7',
  reflect: '#3D6B5A',
  video:   '#A0503A',
}

const TYPE_COLORS_DARK: Record<string, string> = {
  audio:   '#6B9FD4',
  case:    '#A07ED4',
  reflect: '#52A882',
  video:   '#C4785A',
}

type Props = {
  item:       ContentItem
  completed?: boolean
  progress?:  number  // 0–1
  onPress:    () => void
}

const TYPE_BG_LIGHT: Record<string, string> = {
  audio:   '#E8F0F9',
  case:    '#EDE8F5',
  reflect: '#EBF2EE',
  video:   '#F5EAE8',
}

const TYPE_BG_DARK: Record<string, string> = {
  audio:   '#1A2030',
  case:    '#1E1A2C',
  reflect: '#16231E',
  video:   '#261A16',
}

export default function ContentCard({ item, completed = false, progress = 0, onPress }: Props) {
  const { colors: C, isDark } = useTheme()
  const TYPE_COLORS = isDark ? TYPE_COLORS_DARK : TYPE_COLORS_LIGHT
  const TYPE_BG = isDark ? TYPE_BG_DARK : TYPE_BG_LIGHT
  const typeColor = TYPE_COLORS[item.type] ?? C.primary
  const typeBg    = TYPE_BG[item.type] ?? C.primarySoft

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
      <View style={[styles.badge, { backgroundColor: typeBg }]}>
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
        <View style={[styles.checkWrap, { backgroundColor: typeBg }]}>
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
