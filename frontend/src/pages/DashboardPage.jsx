import { useState, useEffect } from 'react'
import styles from './DashboardPage.module.css'

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

export default function DashboardPage({ weeks = [], onNavigateToWeek }) {
  const activeWeek = weeks.find(w => w.status === 'active') ?? weeks[0] ?? { id: 1, title: '…' }
  const doneCount  = weeks.filter(w => w.status === 'done').length
  const progress   = (doneCount / 8) * 100
  const tip        = useDailyTip()

  return (
    <main className={styles.main}>

      <div className={styles.greeting}>{getGreeting()}</div>

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

      <div className={styles.tipCard}>
        <div className={styles.tipLabel}>Dagens tanke</div>
        <p className={styles.tipText}>{tip ?? '…'}</p>
      </div>

    </main>
  )
}
