import { Modal, View, Pressable, StyleSheet, PanResponder, Animated } from 'react-native'
import Text from '@/components/ui/Text'
import { useRef } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'
import { useTheme } from '@/components/ui/ThemeContext'
import { usePlayer } from '@/context/PlayerContext'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function FullPlayer() {
  const { colors: C } = useTheme()
  const { track, isPlaying, position, duration, isFullscreen, pause, resume, seek, dismiss, setFullscreen } = usePlayer()
  const translateY = useRef(new Animated.Value(0)).current

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy)
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.8) {
          Animated.timing(translateY, { toValue: 800, duration: 250, useNativeDriver: true }).start(() => {
            translateY.setValue(0)
            setFullscreen(false)
          })
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start()
        }
      },
    })
  ).current

  const progress = duration > 0 ? position / duration : 0

  async function handlePlayPause() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    isPlaying ? pause() : resume()
  }

  async function handleSeek(forward: boolean) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    seek(Math.max(0, Math.min(duration, position + (forward ? 15 : -15))))
  }

  if (!track) return null

  return (
    <Modal
      visible={isFullscreen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setFullscreen(false)}
    >
      <Animated.View
        style={[styles.container, { backgroundColor: C.background, transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />

        <Pressable onPress={() => setFullscreen(false)} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={28} color={C.mutedText} />
        </Pressable>

        <View style={[styles.cover, { backgroundColor: C.primary + '33' }]}>
          <Ionicons name="musical-notes" size={64} color={C.primary} />
        </View>

        <Text style={[styles.title, { color: C.text }]} numberOfLines={2}>
          {track.title}
        </Text>
        {track.abstract ? (
          <Text style={[styles.abstract, { color: C.mutedText }]} numberOfLines={3}>
            {track.abstract}
          </Text>
        ) : null}

        <View style={styles.scrubber}>
          <Pressable
            onPress={(e) => {
              // tap-to-seek on the track bar
            }}
            style={[styles.scrubTrack, { backgroundColor: C.border }]}
          >
            <View style={[styles.scrubFill, { backgroundColor: C.primary, width: `${progress * 100}%` }]} />
          </Pressable>
          <View style={styles.times}>
            <Text style={[styles.time, { color: C.mutedText }]}>{formatTime(position)}</Text>
            <Text style={[styles.time, { color: C.mutedText }]}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => handleSeek(false)} style={styles.skipBtn}>
            <Ionicons name="play-back" size={28} color={C.text} />
            <Text style={[styles.skipLabel, { color: C.mutedText }]}>15</Text>
          </Pressable>

          <Pressable onPress={handlePlayPause} style={[styles.playBtn, { backgroundColor: C.primary }]}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
          </Pressable>

          <Pressable onPress={() => handleSeek(true)} style={styles.skipBtn}>
            <Ionicons name="play-forward" size={28} color={C.text} />
            <Text style={[styles.skipLabel, { color: C.mutedText }]}>15</Text>
          </Pressable>
        </View>

        <Pressable onPress={dismiss} style={styles.dismissBtn}>
          <Text style={[styles.dismissText, { color: C.mutedText }]}>Lukk spiller</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 48,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginBottom: 12,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: 4,
    marginBottom: 24,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 30,
  },
  abstract: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  scrubber: {
    width: '100%',
    marginBottom: 32,
  },
  scrubTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  scrubFill: {
    height: 4,
    borderRadius: 2,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 13,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
    marginBottom: 40,
  },
  skipBtn: {
    alignItems: 'center',
    gap: 2,
  },
  skipLabel: {
    fontSize: 11,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissBtn: {
    padding: 8,
  },
  dismissText: {
    fontSize: 14,
  },
})
