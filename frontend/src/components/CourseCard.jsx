import styles from './CourseCard.module.css'

const thumbClass = {
  green: styles.thumbGreen,
  amber: styles.thumbAmber,
}

export default function CourseCard({ emoji, name, meta, thumbColor = 'green' }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.thumb} ${thumbClass[thumbColor] || styles.thumbGreen}`}>
        {emoji}
      </div>
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.meta}>{meta}</div>
      </div>
    </div>
  )
}
