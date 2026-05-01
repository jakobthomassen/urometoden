import { useRef, useState, useEffect } from 'react'
import styles from './AudioPlayer.module.css'
import FullscreenPlayer from './FullscreenPlayer'

const MIN_LISTEN_FOR_BAR = 60 // seconds

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function SkipBackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.11" />
    </svg>
  )
}

function SkipForwardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-.49-3.11" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function VolumeIcon({ level }) {
  if (level === 0) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    )
  }
  if (level <= 0.5) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
    )
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  )
}

export default function AudioPlayer({
  src, type, title, info, autoFullscreen, onFullscreenClose,
  itemId, initialPosition = 0, initialListenSeconds = 0, onSaveProgress,
}) {
  const audioRef = useRef(null)
  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const [volume, setVolume]           = useState(0.5)
  const [fullscreen, setFullscreen]   = useState(false)

  // Progress tracking refs
  const listenAccRef    = useRef(initialListenSeconds)
  const playStartRef    = useRef(null)
  const completedRef    = useRef(false)
  const lastSaveTimeRef = useRef(Date.now())

  const playingRef = useRef(playing)
  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => { if (autoFullscreen) setFullscreen(true) }, [])

  // Restore position on metadata load
  useEffect(() => {
    const audio = audioRef.current
    function onLoadedMetadata() {
      setDuration(audio.duration)
      if (initialPosition > 0) {
        audio.currentTime = initialPosition
        setCurrentTime(initialPosition)
      }
    }
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    return () => audio.removeEventListener('loadedmetadata', onLoadedMetadata)
  }, [initialPosition])

  function accumulateListen() {
    if (playStartRef.current !== null) {
      listenAccRef.current += (Date.now() - playStartRef.current) / 1000
      playStartRef.current = null
    }
  }

  function saveProgress(pos, completed = false) {
    if (!onSaveProgress || !itemId) return
    const listenSecs = listenAccRef.current + (playStartRef.current !== null ? (Date.now() - playStartRef.current) / 1000 : 0)
    if (listenSecs >= MIN_LISTEN_FOR_BAR || completed) {
      onSaveProgress(pos, listenSecs, completed)
    }
  }

  // Sync playback events
  useEffect(() => {
    const audio = audioRef.current

    function onTimeUpdate() {
      const t = audio.currentTime
      setCurrentTime(t)

      // Auto-complete at 90%
      if (!completedRef.current && audio.duration > 0 && t / audio.duration >= 0.9) {
        completedRef.current = true
        accumulateListen()
        saveProgress(t, true)
      }
    }

    function onPlay() {
      playStartRef.current = Date.now()
    }

    function onPause() {
      accumulateListen()
      saveProgress(audio.currentTime)
    }

    function onEnded() {
      setPlaying(false)
      accumulateListen()
      saveProgress(0) // reset position on completion
    }

    audio.addEventListener('timeupdate',     onTimeUpdate)
    audio.addEventListener('play',           onPlay)
    audio.addEventListener('pause',          onPause)
    audio.addEventListener('ended',          onEnded)
    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate)
      audio.removeEventListener('play',           onPlay)
      audio.removeEventListener('pause',          onPause)
      audio.removeEventListener('ended',          onEnded)
    }
  }, [onSaveProgress, itemId])

  // 15-second save interval while playing
  useEffect(() => {
    if (!onSaveProgress || !itemId) return
    const interval = setInterval(() => {
      if (playingRef.current) {
        saveProgress(audioRef.current?.currentTime ?? 0)
      }
    }, 15_000)
    return () => clearInterval(interval)
  }, [onSaveProgress, itemId])

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.code === 'Space') {
        e.preventDefault()
        const audio = audioRef.current
        if (playingRef.current) {
          audio.pause()
          setPlaying(false)
        } else {
          audio.play().then(() => setPlaying(true)).catch(() => {})
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        const audio = audioRef.current
        audio.currentTime = Math.max(0, audio.currentTime - 15)
        saveProgress(audio.currentTime)
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        const audio = audioRef.current
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15)
        saveProgress(audio.currentTime)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    audioRef.current.volume = volume
  }, [volume])

  function togglePlay() {
    const audio = audioRef.current
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  function skip(secs) {
    const audio = audioRef.current
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + secs))
    saveProgress(audio.currentTime)
  }

  function handleScrub(e) {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const newTime = pct * duration
    audioRef.current.currentTime = newTime
    saveProgress(newTime)
  }

  function scrubTo(time) {
    const newTime = Math.max(0, Math.min(duration, time))
    audioRef.current.currentTime = newTime
    saveProgress(newTime)
  }

  function handleFullscreenClose() {
    accumulateListen()
    saveProgress(audioRef.current?.currentTime ?? 0)
    setFullscreen(false)
    onFullscreenClose?.()
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={styles.card}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <FullscreenPlayer
        open={fullscreen}
        onClose={handleFullscreenClose}
        title={title}
        info={info}
        type={type}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlay}
        onSkip={skip}
        onScrubTo={scrubTo}
        volume={volume}
        onVolumeChange={setVolume}
      />

      <div className={styles.top}>
        <div className={styles.meta}>
          <div className={styles.tag}>{type}</div>
          <div className={styles.title}>{title}</div>
          <div className={styles.info}>{info}</div>
        </div>

        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={() => skip(-15)} title="15 sek tilbake">
            <SkipBackIcon />
          </button>
          <button className={styles.playBtn} onClick={togglePlay} title={playing ? 'Pause' : 'Spill av'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className={styles.ctrlBtn} onClick={() => skip(15)} title="15 sek frem">
            <SkipForwardIcon />
          </button>
          <button className={styles.fullscreenBtn} onClick={() => setFullscreen(true)} title="Fullskjerm">
            <FullscreenIcon />
          </button>
        </div>
      </div>

      <div className={styles.scrubber}>
        <div className={styles.scrubZone} onClick={handleScrub}>
          <div className={styles.scrubTrack}>
            <div className={styles.scrubFill} style={{ width: `${progress}%` }} />
            <div className={styles.scrubThumb} style={{ left: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.times}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className={styles.volumeRow}>
            <span className={styles.volumeIcon}><VolumeIcon level={volume} /></span>
            <input
              type="range"
              className={styles.volumeSlider}
              min="0"
              max="1"
              step="0.01"
              value={volume}
              style={{ '--fill': `${volume * 100}%` }}
              onChange={e => setVolume(parseFloat(e.target.value))}
              title={`Volum: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
