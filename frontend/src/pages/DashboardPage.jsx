import { useState, useEffect, useRef } from 'react'
import styles from './DashboardPage.module.css'
import { isMember } from '../utils/membership'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'God morgen'
  if (h < 18) return 'God ettermiddag'
  return 'God kveld'
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}


function useDailyTip() {
  const [tip, setTip] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('daily_tip') || 'null')
      if (cached?.date === todayStr()) return cached.body
    } catch {}
    return null
  })

  useEffect(() => {
    if (tip) return
    fetch('/api/tip')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        localStorage.setItem('daily_tip', JSON.stringify({ date: todayStr(), body: data.body }))
        setTip(data.body)
      })
      .catch(() => {})
  }, [tip])

  return tip
}

const BENEFITS = [
  { icon: '♪', label: '8 uker med lyd',    sub: 'Guidede lydøkter til hver uke' },
  { icon: '◎', label: 'Lesecase',           sub: 'Virkelige eksempler og strategier' },
  { icon: '✎', label: 'Refleksjonsøvelser', sub: 'Personlige spørsmål og oppgaver' },
  { icon: '▷', label: 'Videoer',            sub: 'Korte forklaringsvideoer' },
]

const SHOW_TRIAL = true

function NonMemberDashboard({ tip }) {
  return (
    <>
      <div className={styles.heroCard}>
        <div className={styles.heroLabel}>Urometoden</div>
        <h1 className={styles.heroTitle}>8 uker mot indre ro</h1>
        <p className={styles.heroSub}>
          Et strukturert program med lydfiler, leseøkter og refleksjonsoppgaver — designet for å hjelpe deg å håndtere uro og angst i hverdagen.
        </p>
      </div>

      <div className={styles.benefitsGrid}>
        {BENEFITS.map(b => (
          <div key={b.label} className={styles.benefit}>
            <span className={styles.benefitIcon}>{b.icon}</span>
            <div>
              <div className={styles.benefitTitle}>{b.label}</div>
              <div className={styles.benefitSub}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.ctaRow}>
        {SHOW_TRIAL && (
          <button className={styles.ctaBtn} disabled>
            Start 7-dagers prøveperiode
          </button>
        )}
        <button
          className={styles.ctaBtnSec}
          onClick={() => alert('Fakturasiden er ikke tilgjengelig ennå.')}
        >
          Les mer
        </button>
      </div>

      <div className={styles.tipCard}>
        <div className={styles.tipLabel}>Dagens tanke</div>
        <p className={styles.tipText}>{tip ?? '…'}</p>
      </div>
    </>
  )
}

function getRemainingMs(date) {
  return date ? Math.max(0, date.getTime() - Date.now()) : 0
}

function formatCountdown(ms) {
  if (ms <= 0) return null
  const totalSecs = Math.floor(ms / 1000)
  const days  = Math.floor(totalSecs / 86400)
  const hours = Math.floor((totalSecs % 86400) / 3600)
  const mins  = Math.floor((totalSecs % 3600) / 60)
  const secs  = totalSecs % 60
  if (days > 0)  return `${days}d ${hours}t ${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`
  if (hours > 0) return `${hours}t ${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`
  return `${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`
}

function useCountdown(targetDate) {
  const [ms, setMs] = useState(() => getRemainingMs(targetDate))
  const ref = useRef(targetDate)
  useEffect(() => { ref.current = targetDate }, [targetDate])
  useEffect(() => {
    if (!targetDate) return
    setMs(getRemainingMs(targetDate))
    const id = setInterval(() => {
      const remaining = getRemainingMs(ref.current)
      setMs(remaining)
      if (remaining <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return formatCountdown(ms)
}

function MemberDashboard({ weeks, onNavigateToWeek, tip }) {
  const doneCount  = weeks.filter(w => w.status === 'done').length
  const progress   = (doneCount / 8) * 100
  const allDone    = weeks.length > 0 && doneCount === 8

  const activeWeek = weeks.find(w => w.status === 'active')
  const nextLocked = !activeWeek ? weeks.find(w => w.status === 'locked') : null
  const focusWeek  = activeWeek ?? nextLocked ?? weeks[weeks.length - 1]

  const countdown = useCountdown(nextLocked?.unlockAt ?? null)

  if (!focusWeek) return null

  return (
    <>
      <div className={styles.progressCard}>
        <div className={styles.progressCardTop}>
          <div>
            <div className={styles.progressLabel}>
              {allDone ? 'Fullført' : nextLocked ? 'Neste uke' : 'Din reise'}
            </div>
            <div className={styles.progressTitle}>
              {nextLocked && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--text-3)' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              Uke {focusWeek.id} – {focusWeek.title}
            </div>
          </div>
          <div className={styles.progressFraction}>{doneCount} / 8 uker</div>
        </div>

        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>

        {nextLocked && countdown && (
          <div className={styles.countdown}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
            </svg>
            Låses opp om {countdown}
          </div>
        )}

        <div className={styles.progressCardBottom}>
          <span className={styles.progressSub}>
            {allDone
              ? 'Du har fullført alle 8 ukene.'
              : nextLocked
              ? `${doneCount} av 8 uker fullført`
              : doneCount === 0
              ? 'Du er klar til å starte.'
              : `${8 - doneCount} uke${8 - doneCount !== 1 ? 'r' : ''} igjen.`}
          </span>
          {!allDone && (
            <button
              className={styles.continueBtn}
              onClick={() => onNavigateToWeek(focusWeek.id)}
            >
              {doneCount === 0 ? 'Start reisen' : nextLocked ? `Gå til uke ${focusWeek.id}` : 'Fortsett reisen'} →
            </button>
          )}
        </div>
      </div>

      <div className={styles.tipCard}>
        <div className={styles.tipLabel}>Dagens tanke</div>
        <p className={styles.tipText}>{tip ?? '…'}</p>
      </div>
    </>
  )
}

export default function DashboardPage({ weeks = [], onNavigateToWeek, user }) {
  const tip          = useDailyTip()
  const memberAccess = isMember(user)

  return (
    <main className={styles.main}>
      <div className={styles.greeting}>{getGreeting()}</div>
      {memberAccess
        ? <MemberDashboard weeks={weeks} onNavigateToWeek={onNavigateToWeek} tip={tip} />
        : <NonMemberDashboard tip={tip} />
      }
    </main>
  )
}
