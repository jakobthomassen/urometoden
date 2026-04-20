import styles from './Sidebar.module.css'

const LIBRARY_ITEMS = [
  { icon: '♪', label: 'Lydfiler',    type: 'audio'   },
  { icon: '◎', label: 'Case-filer',  type: 'case'    },
  { icon: '✎', label: 'Refleksjon',  type: 'reflect' },
  { icon: '▷', label: 'Videoer',     type: 'video'   },
]

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function StatusDot({ status }) {
  const cls = { done: styles.dotDone, active: styles.dotActive, locked: styles.dotLocked }
  return <span className={`${styles.dot} ${cls[status] || styles.dotLocked}`} />
}

function WeekBadge({ status }) {
  if (status === 'done')   return <span className={`${styles.weekBadge} ${styles.doneBadge}`}>✓</span>
  if (status === 'active') return <span className={`${styles.weekBadge} ${styles.activeBadge}`}>→</span>
  return <span className={styles.weekBadge}>🔒</span>
}

export default function Sidebar({ weeks = [], currentWeek, collapsed, onToggleCollapse, onNavigate, memberAccess }) {
  const doneCount = weeks.filter(w => w.status === 'done').length
  const progress  = (doneCount / 8) * 100

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>

      <div className={styles.topBar}>
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Vis sidebar' : 'Skjul sidebar'}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <div className={styles.inner}>

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

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Uroreisen</span>
          {weeks.map(week => (
            <button
              key={week.id}
              disabled={week.status === 'locked' || !memberAccess}
              className={`${styles.weekItem} ${week.id === currentWeek ? styles.active : ''}`}
              onClick={() => memberAccess && onNavigate('Uke', week.id)}
            >
              <StatusDot status={memberAccess ? week.status : 'locked'} />
              Uke {week.id} – {week.title}
              {memberAccess ? <WeekBadge status={week.status} /> : <span className={styles.weekBadge}>🔒</span>}
            </button>
          ))}
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>Utforsk fritt</span>
          {LIBRARY_ITEMS.map(item => (
            <button
              key={item.label}
              disabled={!memberAccess}
              className={`${styles.libItem} ${!memberAccess ? styles.libItemLocked : ''}`}
              onClick={() => memberAccess && onNavigate('Bibliotek', item.type)}
            >
              <span className={`${styles.libIcon} ${styles[item.type]}`}>{item.icon}</span>
              {item.label}
              {!memberAccess && <span className={styles.weekBadge}>🔒</span>}
            </button>
          ))}
        </div>

      </div>
    </aside>
  )
}
