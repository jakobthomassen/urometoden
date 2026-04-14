import styles from './ContentCard.module.css'

const typeClass = {
  audio:   styles.typeAudio,
  case:    styles.typeCase,
  reflect: styles.typeReflect,
  video:   styles.typeVideo,
}

export default function ContentCard({ type, label, title, meta }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.tag} ${typeClass[type] || ''}`}>{label}</div>
      <div className={styles.title}>{title}</div>
      <div className={styles.meta}>{meta}</div>
    </div>
  )
}
