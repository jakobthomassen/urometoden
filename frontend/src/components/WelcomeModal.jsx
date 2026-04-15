import { useState, useEffect } from 'react'
import styles from './WelcomeModal.module.css'

const VISITED_KEY = 'uro_visited'

export default function WelcomeModal({ onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(VISITED_KEY)) {
      setVisible(true)
    }
  }, [])

  function handleStart() {
    localStorage.setItem(VISITED_KEY, '1')
    setVisible(false)
    onStart?.()
  }

  if (!visible) return null

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.eyebrow}>Urometoden</div>
        <h2 className={styles.title}>Velkommen</h2>
        <p className={styles.body}>
          Du har tatt et viktig steg. Over de neste 8 ukene vil du lære å møte
          din indre uro med nysgjerrighet fremfor motstand – og gradvis finne
          mer ro i hverdagen.
        </p>
        <p className={styles.hint}>
          Start med ukens lydfil, og gå i ditt eget tempo.
        </p>
        <button className={styles.cta} onClick={handleStart}>
          Kom i gang
        </button>
      </div>
    </div>
  )
}