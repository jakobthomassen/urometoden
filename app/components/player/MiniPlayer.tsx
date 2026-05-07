import { Pressable, View, Text, StyleSheet } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/components/ui/ThemeContext'
import { usePlayer } from '@/context/PlayerContext'

export default function MiniPlayer() {
  const { colors: C } = useTheme()
  const { track, isPlaying, position, duration, pause, resume, setFullscreen } = usePlayer()

  if (!track) return null

  const progress = duration > 0 ? position / duration : 0

  async function handlePlayPause() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    isPlaying ? pause() : resume()
  }

  return (
    <Pressable
      onPress={() => setFullscreen(true)}
      style={[styles.container, { backgroundColor: C.card, borderTopColor: C.border }]}
    >
      <View style={[styles.dot, { backgroundColor: C.primary }]} />

      <View style={styles.info}>
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1}>
          {track.title}
        </Text>
        <View style={[styles.track, { backgroundColor: C.border }]}>
          <View style={[styles.fill, { backgroundColor: C.primary, width: `${progress * 100}%` }]} />
        </View>
      </View>

      <Pressable onPress={handlePlayPause} style={styles.btn} hitSlop={12}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={24}
          color={C.text}
        />
      </Pressable>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 3,
    borderRadius: 2,
  },
  btn: {
    padding: 4,
  },
})
