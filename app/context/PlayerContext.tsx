import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { Audio } from 'expo-av'
import { BASE } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export type Track = {
  id:       number
  title:    string
  abstract: string | null
  r2_key:   string
  meta:     string | null
}

type PlayerContextType = {
  track:         Track | null
  isPlaying:     boolean
  position:      number
  duration:      number
  isFullscreen:  boolean
  play:          (track: Track) => Promise<void>
  pause:         () => Promise<void>
  resume:        () => Promise<void>
  seek:          (seconds: number) => Promise<void>
  dismiss:       () => Promise<void>
  setFullscreen: (v: boolean) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const soundRef   = useRef<Audio.Sound | null>(null)
  const [track, setTrack]               = useState<Track | null>(null)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [position, setPosition]         = useState(0)
  const [duration, setDuration]         = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS:    true,
      staysActiveInBackground: true,
    })
  }, [])

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync() }
  }, [])

  function onStatus(status: any) {
    if (!status.isLoaded) return
    setIsPlaying(status.isPlaying)
    setPosition(status.positionMillis / 1000)
    if (status.durationMillis) setDuration(status.durationMillis / 1000)
  }

  async function play(newTrack: Track) {
    if (soundRef.current) {
      await soundRef.current.unloadAsync()
      soundRef.current = null
    }
    setTrack(newTrack)
    setPosition(0)
    setDuration(0)
    setIsFullscreen(true)

    const uri = `${BASE}/api/audio/${newTrack.r2_key}?token=${token}`
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      onStatus
    )
    soundRef.current = sound
    setIsPlaying(true)
  }

  async function pause() {
    await soundRef.current?.pauseAsync()
  }

  async function resume() {
    await soundRef.current?.playAsync()
  }

  async function seek(seconds: number) {
    await soundRef.current?.setPositionAsync(seconds * 1000)
    setPosition(seconds)
  }

  async function dismiss() {
    await soundRef.current?.unloadAsync()
    soundRef.current = null
    setTrack(null)
    setIsPlaying(false)
    setPosition(0)
    setDuration(0)
    setIsFullscreen(false)
  }

  return (
    <PlayerContext.Provider value={{
      track, isPlaying, position, duration, isFullscreen,
      play, pause, resume, seek, dismiss, setFullscreen,
    }}>
      {children}
    </PlayerContext.Provider>
  )

  function setFullscreen(v: boolean) { setIsFullscreen(v) }
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider')
  return ctx
}
