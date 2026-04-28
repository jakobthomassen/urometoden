import styles from './ContentCard.module.css'

const typeClass = {
  audio:   styles.typeAudio,
  case:    styles.typeCase,
  reflect: styles.typeReflect,
  video:   styles.typeVideo,
}

export default function ContentCard({ type, label, title, meta, abstract, weeks, onClick, completed = false }) {
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
      {completed && <span className={styles.check} aria-label="Fullført">✓</span>}
    </div>
  )
}
