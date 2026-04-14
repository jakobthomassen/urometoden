import styles from './AboutCard.module.css'

export default function AboutCard({ heading, body }) {
  return (
    <div className={styles.card}>
      <p>
        <strong>{heading}</strong>
        <br />
        {body}
      </p>
    </div>
  )
}
