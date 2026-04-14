import styles from './Sidebar.module.css'
import { WEEKS } from '../data/weeks'

const LIBRARY_ITEMS = [
  { icon: '♪', label: 'Lydfiler – oppmerksomhet', type: 'audio' },
  { icon: '◎', label: 'Case-filer',               type: 'case' },
  { icon: '▷', label: 'Videoer',                  type: 'video' },
]

function StatusDot({ status }) {
  const cls = { done: styles.dotDone, active: styles.dotActive, locked: styles.dotLocked }
  return <span className={`${styles.dot} ${cls[status] || styles.dotLocked}`} />
}

function WeekBadge({ status }) {
  if (status === 'done')   return <span className={`${styles.weekBadge} ${styles.doneBadge}`}>✓</span>
  if (status === 'active') return <span className={`${styles.weekBadge} ${styles.activeBadge}`}>→</span>
  return <span className={styles.weekBadge}>🔒</span>
}

export default function Sidebar({ currentWeek }) {
  const doneCount = WEEKS.filter(w => w.status === 'done').length
  const progress = (doneCount / 8) * 100

  return (
    <aside className={styles.sidebar}>
      <div className={styles.inner}>

        {/* Progress */}
        <div className={styles.progressBlock}>
          <div className={styles.progHeader}>
            <span className={styles.progName}>Din reise</span>
            <span className={styles.progStep}>Uke {currentWeek} av 8</span>
          </div>
          <div className={styles.progTrack}>
            <div className={styles.progFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progSub}>
            {doneCount} uke{doneCount !== 1 ? 'r' : ''} fullført · {8 - doneCount} igjen
          </div>
        </div>

        {/* Week list */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Uroreisen</span>
          {WEEKS.map(week => (
            <button
              key={week.id}
              disabled={week.status === 'locked'}
              className={`${styles.weekItem} ${week.id === currentWeek ? styles.active : ''}`}
            >
              <StatusDot status={week.status} />
              Uke {week.id} – {week.title}
              <WeekBadge status={week.status} />
            </button>
          ))}
        </div>

        {/* Library */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Utforsk fritt</span>
          {LIBRARY_ITEMS.map(item => (
            <button key={item.label} className={styles.libItem}>
              <span className={`${styles.libIcon} ${styles[item.type]}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

      </div>
    </aside>
  )
}
