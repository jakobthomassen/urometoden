import { useEffect, useRef } from 'react'
import styles from './FullscreenPlayer.module.css'

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00'
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const WAVES = [
  { freq: 0.0032, amp: 80,  speed: 0.00016, phase: 0.0, color: 'rgba(82,168,130,0.22)',  lw: 1.5 },
  { freq: 0.0055, amp: 50,  speed: 0.00026, phase: 2.1, color: 'rgba(200,168,110,0.16)', lw: 1.0 },
  { freq: 0.0022, amp: 110, speed: 0.00010, phase: 4.4, color: 'rgba(82,168,130,0.09)',  lw: 2.5 },
  { freq: 0.0070, amp: 32,  speed: 0.00038, phase: 1.5, color: 'rgba(200,168,110,0.18)', lw: 0.8 },
  { freq: 0.0042, amp: 65,  speed: 0.00020, phase: 3.7, color: 'rgba(110,160,210,0.10)', lw: 1.2 },
]

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

      WAVES.forEach(wave => {
        ctx.beginPath()
        ctx.strokeStyle = wave.color
        ctx.lineWidth   = wave.lw
        ctx.lineJoin    = 'round'

        for (let x = 0; x <= w; x += 3) {
          const y = h * 0.5 + Math.sin(x * wave.freq + ts * wave.speed + wave.phase) * wave.amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
      })

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

export default function FullscreenPlayer({
  open, onClose,
  title, info, type,
  playing, currentTime, duration,
  onTogglePlay, onSkip, onScrubTo,
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
      </div>
    </div>
  )
}
