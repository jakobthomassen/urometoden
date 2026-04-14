import styles from './TestimonyCard.module.css'

export default function TestimonyCard({ quote, author }) {
  return (
    <div className={styles.card}>
      <div className={styles.quoteMark}>"</div>
      <div className={styles.quote}>{quote}</div>
      <div className={styles.author}>— {author}</div>
    </div>
  )
}
