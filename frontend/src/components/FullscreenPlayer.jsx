import { useEffect, useRef } from 'react'
import styles from './FullscreenPlayer.module.css'

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Each wave is drawn as a ribbon (filled shape) so width can vary along its length.
// amp       — main wave amplitude
// freq      — main wave spatial frequency
// speed     — how fast the wave scrolls horizontally
// phase     — initial phase offset
// harmonic  — strength of an overtone mixed in (breaks up the perfect sine shape)
// wFreq     — spatial frequency of the width oscillation
// wSpeed    — how fast the width pulses over time
// wPhase    — initial phase of the width oscillation
// wMin/wMax — min and max half-width of the ribbon in px
// driftAmp  — how far the whole wave floats vertically
// driftSpeed— how fast the vertical float cycles
// driftPhase— initial phase of the drift
const WAVES = [
  {
    freq: 0.0032, amp: 75,  speed: 0.00016, phase: 0.0, harmonic: 0.22,
    wFreq: 0.009, wSpeed: 0.00021, wPhase: 0.0,  wMin: 0.4, wMax: 4.5,
    driftAmp: 28, driftSpeed: 0.000055, driftPhase: 0.0,
    color: 'rgba(82,168,130,0.24)',
  },
  {
    freq: 0.0055, amp: 48,  speed: 0.00027, phase: 2.1, harmonic: 0.18,
    wFreq: 0.014, wSpeed: 0.00030, wPhase: 1.8,  wMin: 0.3, wMax: 3.0,
    driftAmp: 18, driftSpeed: 0.000070, driftPhase: 2.4,
    color: 'rgba(200,168,110,0.18)',
  },
  {
    freq: 0.0022, amp: 105, speed: 0.00010, phase: 4.4, harmonic: 0.28,
    wFreq: 0.007, wSpeed: 0.00015, wPhase: 3.3,  wMin: 0.8, wMax: 6.0,
    driftAmp: 40, driftSpeed: 0.000040, driftPhase: 1.1,
    color: 'rgba(82,168,130,0.10)',
  },
  {
    freq: 0.0068, amp: 30,  speed: 0.00040, phase: 1.5, harmonic: 0.15,
    wFreq: 0.018, wSpeed: 0.00044, wPhase: 0.7,  wMin: 0.2, wMax: 2.5,
    driftAmp: 14, driftSpeed: 0.000090, driftPhase: 3.9,
    color: 'rgba(200,168,110,0.20)',
  },
  {
    freq: 0.0042, amp: 62,  speed: 0.00021, phase: 3.7, harmonic: 0.20,
    wFreq: 0.011, wSpeed: 0.00026, wPhase: 2.2,  wMin: 0.3, wMax: 3.8,
    driftAmp: 22, driftSpeed: 0.000062, driftPhase: 5.1,
    color: 'rgba(110,160,210,0.11)',
  },
]

function drawRibbon(ctx, wave, ts, w, h) {
  const step = 4
  const points = []

  // Vertical drift — the whole wave floats up and down slowly
  const drift = Math.sin(ts * wave.driftSpeed + wave.driftPhase) * wave.driftAmp

  for (let x = 0; x <= w; x += step) {
    // Primary sine + harmonic overtone for organic shape
    const y = h * 0.5 + drift
      + Math.sin(x * wave.freq + ts * wave.speed + wave.phase) * wave.amp
      + Math.sin(x * wave.freq * 2.7 + ts * wave.speed * 1.9 + wave.phase * 1.4) * wave.amp * wave.harmonic

    // Half-width pulses along the line
    const t01 = 0.5 + 0.5 * Math.sin(x * wave.wFreq + ts * wave.wSpeed + wave.wPhase)
    const hw  = wave.wMin + (wave.wMax - wave.wMin) * t01

    points.push({ x, y, hw })
  }

  // Draw ribbon: top edge forward, bottom edge backward
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y - points[0].hw)
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y - points[i].hw)
  }
  for (let i = points.length - 1; i >= 0; i--) {
    ctx.lineTo(points[i].x, points[i].y + points[i].hw)
  }
  ctx.closePath()
  ctx.fillStyle = wave.color
  ctx.fill()
}

function WaveCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function draw(ts) {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)
      WAVES.forEach(wave => drawRibbon(ctx, wave, ts, w, h))
      animId = requestAnimationFrame(draw)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} />
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function SkipBackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.11" />
    </svg>
  )
}

function SkipForwardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-.49-3.11" />
    </svg>
  )
}

function VolumeIcon({ level }) {
  if (level === 0) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  )
  if (level <= 0.5) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

export default function FullscreenPlayer({
  open, onClose,
  title, info, type,
  playing, currentTime, duration,
  onTogglePlay, onSkip, onScrubTo,
  volume, onVolumeChange,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const progress = duration ? (currentTime / duration) * 100 : 0

  function handleScrub(e) {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onScrubTo(pct * duration)
  }

  return (
    <div className={styles.overlay}>
      <WaveCanvas />

      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.tag}>{type}</span>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.info}>{info}</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
          <CloseIcon />
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.scrubZone} onClick={handleScrub}>
          <div className={styles.scrubTrack}>
            <div className={styles.scrubFill} style={{ width: `${progress}%` }} />
            <div className={styles.scrubThumb} style={{ left: `${progress}%` }} />
          </div>
        </div>
        <div className={styles.times}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className={styles.buttons}>
          <button className={styles.ctrlBtn} onClick={() => onSkip(-15)} title="15 sek tilbake">
            <SkipBackIcon />
          </button>
          <button className={styles.playBtn} onClick={onTogglePlay} title={playing ? 'Pause' : 'Spill av'}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className={styles.ctrlBtn} onClick={() => onSkip(15)} title="15 sek frem">
            <SkipForwardIcon />
          </button>
        </div>
        <div className={styles.volumeRow}>
          <span className={styles.volumeIcon}><VolumeIcon level={volume ?? 0.5} /></span>
          <input
            type="range"
            className={styles.volumeSlider}
            min="0" max="1" step="0.01"
            value={volume ?? 0.5}
            style={{ '--fill': `${(volume ?? 0.5) * 100}%` }}
            onChange={e => onVolumeChange?.(parseFloat(e.target.value))}
            title={`Volum: ${Math.round((volume ?? 0.5) * 100)}%`}
          />
        </div>
      </div>
    </div>
  )
}
