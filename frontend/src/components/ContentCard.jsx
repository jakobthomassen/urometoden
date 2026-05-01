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
  listenSeconds = 0, positionSeconds = 0,
}) {
  const showBar = (type === 'audio' || type === 'video') && listenSeconds >= 60
  const duration = parseDurationMeta(meta)
  const barPct   = showBar && duration > 0
    ? Math.min(100, (positionSeconds / duration) * 100)
    : 0

  return (
    <div className={`${styles.card} ${completed ? styles.completed : ''}`} onClick={onClick}>
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
      {completed && <span className={styles.check} aria-label="Fullført">✓</span>}
    </div>
  )
}
