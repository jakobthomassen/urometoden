import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import { Audio } from 'expo-av'
import { BASE, apiFetch } from '@/lib/api'
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

  const soundRef      = useRef<Audio.Sound | null>(null)
  const trackRef      = useRef<Track | null>(null)
  const positionRef   = useRef(0)
  const durationRef   = useRef(0)
  const listenAccRef  = useRef(0)    // seconds accumulated this session
  const lastPosRef    = useRef(0)    // previous position for delta accumulation
  const lastSaveRef   = useRef(0)    // Date.now() of last DB write
  const completedRef  = useRef(false)

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

  // Dismiss player when user signs out
  useEffect(() => {
    if (!token && trackRef.current) {
      soundRef.current?.unloadAsync()
      soundRef.current   = null
      trackRef.current   = null
      setTrack(null)
      setIsPlaying(false)
      setPosition(0)
      setDuration(0)
      setIsFullscreen(false)
    }
  }, [token])

  async function saveProgress(completed = false) {
    const t = trackRef.current
    if (!t || !token) return
    try {
      await apiFetch(`/api/me/progress/${t.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          position_seconds: Math.floor(positionRef.current),
          listen_seconds:   Math.floor(listenAccRef.current),
          ...(completed ? { completed: true } : {}),
        }),
      }, token)
    } catch {}
    lastSaveRef.current = Date.now()
  }

  function onStatus(status: any) {
    if (!status.isLoaded) return

    const pos     = status.positionMillis / 1000
    const dur     = status.durationMillis ? status.durationMillis / 1000 : 0
    const playing = status.isPlaying

    // Accumulate listen time — small positive deltas only (ignore scrubs)
    if (playing && lastPosRef.current > 0) {
      const delta = pos - lastPosRef.current
      if (delta > 0 && delta < 2) listenAccRef.current += delta
    }
    lastPosRef.current  = pos
    positionRef.current = pos
    if (dur) durationRef.current = dur

    setIsPlaying(playing)
    setPosition(pos)
    if (dur) setDuration(dur)

    // Auto-complete at 90%
    if (dur > 0 && pos / dur >= 0.9 && !completedRef.current) {
      completedRef.current = true
      saveProgress(true)
      return
    }

    // Periodic save every 15 s while playing
    if (playing && Date.now() - lastSaveRef.current > 15_000) {
      saveProgress()
    }
  }

  async function play(newTrack: Track) {
    if (soundRef.current) {
      await soundRef.current.unloadAsync()
      soundRef.current = null
    }

    trackRef.current    = newTrack
    positionRef.current = 0
    durationRef.current = 0
    listenAccRef.current  = 0
    lastPosRef.current    = 0
    lastSaveRef.current   = 0
    completedRef.current  = false

    setTrack(newTrack)
    setPosition(0)
    setDuration(0)
    setIsFullscreen(true)

    // Restore saved position
    let startPos = 0
    try {
      const r = await apiFetch('/api/me/progress', {}, token)
      if (r.ok) {
        const data = await r.json()
        startPos = data.progress?.[newTrack.id]?.position_seconds ?? 0
      }
    } catch {}

    const uri = `${BASE}/api/audio/${newTrack.r2_key}?token=${token}`
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, positionMillis: startPos * 1000 },
      onStatus,
    )
    soundRef.current    = sound
    positionRef.current = startPos
    lastPosRef.current  = startPos
    setPosition(startPos)
    setIsPlaying(true)
  }

  async function pause() {
    await soundRef.current?.pauseAsync()
    await saveProgress()
  }

  async function resume() {
    await soundRef.current?.playAsync()
  }

  async function seek(seconds: number) {
    await soundRef.current?.setPositionAsync(seconds * 1000)
    positionRef.current = seconds
    lastPosRef.current  = seconds
    setPosition(seconds)
    await saveProgress()
  }

  async function dismiss() {
    await saveProgress()
    await soundRef.current?.unloadAsync()
    soundRef.current    = null
    trackRef.current    = null
    setTrack(null)
    setIsPlaying(false)
    setPosition(0)
    setDuration(0)
    setIsFullscreen(false)
  }

  function setFullscreen(v: boolean) { setIsFullscreen(v) }

  return (
    <PlayerContext.Provider value={{
      track, isPlaying, position, duration, isFullscreen,
      play, pause, resume, seek, dismiss, setFullscreen,
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be inside PlayerProvider')
  return ctx
}
