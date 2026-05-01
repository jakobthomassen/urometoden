import { useState, useEffect } from 'react'
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

function formatListenTime(secs) {
  if (secs < 60)   return '< 1 min'
  if (secs < 3600) return `${Math.floor(secs / 60)} min`
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return m > 0 ? `${h}t ${m}m` : `${h}t`
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

function StatGrid({ stats }) {
  const { streak = 0, total_listen_seconds = 0, weeks_completed = 0 } = stats ?? {}
  const streakLabel = streak >= 3 ? `${streak} 🔥` : `${streak}`

  return (
    <div className={styles.statGrid}>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{formatListenTime(total_listen_seconds)}</div>
        <div className={styles.statLabel}>Lyttetid</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{streakLabel}</div>
        <div className={styles.statLabel}>Dager på rad</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{weeks_completed} / 8</div>
        <div className={styles.statLabel}>Uker fullført</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statValue}>—</div>
        <div className={styles.statLabel}>Kommer snart</div>
      </div>
    </div>
  )
}

function MemberDashboard({ weeks, onNavigateToWeek, tip, stats }) {
  const activeWeek = weeks.find(w => w.status === 'active') ?? weeks[0] ?? { id: 1, title: '…' }
  const doneCount  = weeks.filter(w => w.status === 'done').length
  const progress   = (doneCount / 8) * 100

  return (
    <>
      <div className={styles.progressCard}>
        <div className={styles.progressCardTop}>
          <div>
            <div className={styles.progressLabel}>Din reise</div>
            <div className={styles.progressTitle}>
              Uke {activeWeek.id} – {activeWeek.title}
            </div>
          </div>
          <div className={styles.progressFraction}>{doneCount} / 8 uker</div>
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressCardBottom}>
          <span className={styles.progressSub}>
            {doneCount === 0
              ? 'Du er klar til å starte.'
              : `${8 - doneCount} uke${8 - doneCount !== 1 ? 'r' : ''} igjen.`}
          </span>
          <button
            className={styles.continueBtn}
            onClick={() => onNavigateToWeek(activeWeek.id)}
          >
            {doneCount === 0 ? 'Start reisen' : 'Fortsett reisen'} →
          </button>
        </div>
      </div>

      <StatGrid stats={stats} />

      <div className={styles.tipCard}>
        <div className={styles.tipLabel}>Dagens tanke</div>
        <p className={styles.tipText}>{tip ?? '…'}</p>
      </div>
    </>
  )
}

export default function DashboardPage({ weeks = [], onNavigateToWeek, user, stats }) {
  const tip          = useDailyTip()
  const memberAccess = isMember(user)

  return (
    <main className={styles.main}>
      <div className={styles.greeting}>{getGreeting()}</div>
      {memberAccess
        ? <MemberDashboard weeks={weeks} onNavigateToWeek={onNavigateToWeek} tip={tip} stats={stats} />
        : <NonMemberDashboard tip={tip} />
      }
    </main>
  )
}
