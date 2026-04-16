import styles from './JourneyPage.module.css'
import { WEEKS } from '../data/weeks'

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export default function JourneyPage({ onNavigateToWeek }) {
  const doneCount = WEEKS.filter(w => w.status === 'done').length
  const progress  = (doneCount / 8) * 100

  return (
    <main className={styles.main}>

      <div className={styles.header}>
        <h1 className={styles.title}>Uroreisen</h1>
        <p className={styles.subtitle}>8 uker mot mer ro</p>
      </div>

      <div className={styles.progressRow}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <span className={styles.progressLabel}>{doneCount} av 8 uker fullført</span>
      </div>

      <div className={styles.weekList}>
        {WEEKS.map((week, i) => {
          const isDone   = week.status === 'done'
          const isActive = week.status === 'active'
          const isLocked = week.status === 'locked'

          return (
            <button
              key={week.id}
              disabled={isLocked}
              className={[
                styles.weekCard,
                isDone   ? styles.done   : '',
                isActive ? styles.active : '',
                isLocked ? styles.locked : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !isLocked && onNavigateToWeek(week.id)}
            >
              <div className={styles.weekLeft}>
                <div className={`${styles.badge} ${isDone ? styles.badgeDone : isActive ? styles.badgeActive : styles.badgeLocked}`}>
                  {isDone   ? <CheckIcon /> : isLocked ? <LockIcon /> : week.id}
                </div>
                <div className={styles.connector} data-last={i === WEEKS.length - 1 || undefined} />
              </div>

              <div className={styles.weekContent}>
                <div className={styles.weekMeta}>Uke {week.id}</div>
                <div className={styles.weekTitle}>{week.title}</div>
                <div className={styles.weekDesc}>{week.description}</div>
              </div>

              {!isLocked && (
                <div className={styles.weekArrow}>
                  <ArrowIcon />
                </div>
              )}
            </button>
          )
        })}
      </div>

    </main>
  )
}
