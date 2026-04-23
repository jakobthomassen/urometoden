import { useRef, useState, useEffect } from 'react'
import styles from './AudioPlayer.module.css'
import FullscreenPlayer from './FullscreenPlayer'

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

export default function AudioPlayer({ src, type, title, info, autoFullscreen, onFullscreenClose }) {
  const audioRef = useRef(null)
  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const [volume, setVolume]           = useState(0.5)
  const [fullscreen, setFullscreen]   = useState(false)

  // Ref so the keydown handler always sees the latest playing value
  const playingRef = useRef(playing)
  useEffect(() => { playingRef.current = playing }, [playing])

  useEffect(() => { if (autoFullscreen) setFullscreen(true) }, [])

  // Sync playback events
  useEffect(() => {
    const audio = audioRef.current
    const onTimeUpdate     = () => setCurrentTime(audio.currentTime)
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded          = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  // Global keyboard shortcuts — space = play/pause, arrows = ±15 s
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
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        const audio = audioRef.current
        audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Sync volume to audio element
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
  }

  function handleScrub(e) {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = pct * duration
  }

  function scrubTo(time) {
    audioRef.current.currentTime = Math.max(0, Math.min(duration, time))
  }

  const progress = duration ? (currentTime / duration) * 100 : 0

  return (
    <div className={styles.card}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <FullscreenPlayer
        open={fullscreen}
        onClose={() => { setFullscreen(false); onFullscreenClose?.() }}
        title={title}
        info={info}
        type={type}
        playing={playing}
        currentTime={currentTime}
        duration={duration}
        onTogglePlay={togglePlay}
        onSkip={skip}
        onScrubTo={scrubTo}
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
