import styles from './ContentCard.module.css'

const typeClass = {
  audio:   styles.typeAudio,
  case:    styles.typeCase,
  reflect: styles.typeReflect,
  video:   styles.typeVideo,
}

function parseDurationMeta(meta) {
  if (!meta) return 0
  const mh = meta.match(/(\d+)m\s*(\d+)s/)
  if (mh) return parseInt(mh[1]) * 60 + parseInt(mh[2])
  const mm = meta.match(/(\d+)m/)
  if (mm) return parseInt(mm[1]) * 60
  return 0
}

export default function ContentCard({
  type, label, title, meta, abstract, weeks, onClick, completed = false,
  listenSeconds = 0, positionSeconds = 0, isPlaying = false, onMarkComplete,
}) {
  const showBar = (type === 'audio' || type === 'video') && listenSeconds >= 60 && !completed
  const duration = parseDurationMeta(meta)
  const barPct   = showBar && duration > 0
    ? Math.min(100, (positionSeconds / duration) * 100)
    : 0

  return (
    <div
      className={`${styles.card} ${completed ? styles.completed : ''} ${isPlaying ? styles.playing : ''}`}
      onClick={onClick}
    >
      <div className={`${styles.tag} ${typeClass[type] || ''}`}>{label}</div>
      <div className={styles.title}>{title}</div>
      {abstract && <div className={styles.descriptor}>{abstract}</div>}
      {(meta || weeks?.length > 0) && (
        <div className={styles.footer}>
          {meta && <span className={styles.meta}>{meta}</span>}
          {weeks?.length > 0 && weeks.map(w => (
            <span key={w} className={styles.weekChip}>Uke {w}</span>
          ))}
        </div>
      )}
      {showBar && (
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${barPct}%` }} />
        </div>
      )}
      {onMarkComplete
        ? (
          <button
            className={`${styles.manualCheck} ${completed ? styles.manualCheckDone : ''}`}
            onClick={e => { e.stopPropagation(); if (!completed) onMarkComplete() }}
            aria-label={completed ? 'Fullført' : 'Merk som fullført'}
            title={completed ? 'Fullført' : 'Merk som fullført'}
          >
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 6 5 9 10 3" />
            </svg>
          </button>
        )
        : completed && <span className={styles.check} aria-label="Fullført">✓</span>
      }
    </div>
  )
}
