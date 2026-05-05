import { useState, useEffect } from 'react'
import styles from './RightPanel.module.css'
import StatCard from './StatCard'
import TestimonyCard from './TestimonyCard'
import CourseCard from './CourseCard'

function getUnlockLabel(unlockAt) {
  if (!unlockAt) return null
  const ms    = unlockAt.getTime() - Date.now()
  if (ms <= 0) return 'Klar nå'
  const hours = ms / 3_600_000
  if (hours < 1)   return `Åpner om ${Math.ceil(ms / 60_000)} min`
  if (hours < 24)  return `Åpner om ${Math.ceil(hours)} timer`
  const days = Math.ceil(hours / 24)
  return `Åpner om ${days} dag${days !== 1 ? 'er' : ''}`
}

function useUnlockLabel(unlockAt) {
  const [label, setLabel] = useState(() => getUnlockLabel(unlockAt))
  useEffect(() => {
    setLabel(getUnlockLabel(unlockAt))
    if (!unlockAt) return
    const id = setInterval(() => setLabel(getUnlockLabel(unlockAt)), 5 * 60_000)
    return () => clearInterval(id)
  }, [unlockAt])
  return label
}

function fmtListenTime(secs = 0) {
  if (secs < 60)   return '0m'
  if (secs < 3600) return `${Math.floor(secs / 60)}m`
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return m > 0 ? `${h}t ${m}m` : `${h}t`
}

const TESTIMONIALS = [
  {
    quote: 'For første gang forstår jeg hva uroen faktisk vil meg – det endret alt.',
    author: 'Kurs-deltaker, Oslo',
  },
  {
    quote: 'Lydfilene er utrolig beroligende. Jeg gleder meg til hver uke.',
    author: 'Deltaker, Bergen',
  },
]

const COURSES = [
  { emoji: '🎓', name: 'Uroskolen – Grunnkurs',  meta: '8 moduler · Tilgjengelig nå',        thumbColor: 'green' },
  { emoji: '📖', name: 'Fordypningskurs',          meta: 'Tilgjengelig etter uke 4',            thumbColor: 'amber' },
  { emoji: '✦',  name: 'Uroskolen live',           meta: 'Neste sesjon: 28. april',             thumbColor: 'green' },
]

export default function RightPanel({ stats = {}, weeks = [] }) {
  const { streak = 0, total_listen_seconds = 0, weeks_completed = 0 } = stats
  const streakDisplay  = streak >= 3 ? `${streak} 🔥` : `${streak}`
  const allDone        = weeks.length > 0 && weeks_completed === 8
  const nextWeek       = !allDone ? weeks.find(w => w.status === 'locked') : null
  const unlockLabel    = useUnlockLabel(nextWeek?.unlockAt ?? null)

  const STATS = [
    { value: fmtListenTime(total_listen_seconds), label: 'Total lyttetid' },
    { value: streakDisplay,                        label: 'Dager i strekk' },
    { value: `${weeks_completed}/8`,               label: 'Uker fullført'  },
    { value: '—',                                  label: 'Kommer snart'   },
  ]

  return (
    <aside className={styles.panel}>

      <section>
        <div className={styles.sectionTitle}>Din fremgang</div>
        <div className={styles.statGrid}>
          {STATS.map(s => <StatCard key={s.label} value={s.value} label={s.label} />)}
        </div>
      </section>

      {nextWeek && (
        <section>
          <div className={styles.sectionTitle}>Neste uke</div>
          <div className={styles.upcomingCard}>
            <div className={styles.upcomingBadge}>{nextWeek.id}</div>
            <div>
              <div className={styles.upcomingLabel}>{unlockLabel ?? 'Låses opp etter denne uken'}</div>
              <div className={styles.upcomingTitle}>{nextWeek.title}</div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className={styles.sectionTitle}>Deltakere forteller</div>
        {TESTIMONIALS.map(t => (
          <TestimonyCard key={t.author} quote={t.quote} author={t.author} />
        ))}
      </section>

      <section>
        <div className={styles.sectionTitle}>Kurs</div>
        {COURSES.map(c => (
          <CourseCard key={c.name} {...c} />
        ))}
      </section>

    </aside>
  )
}
