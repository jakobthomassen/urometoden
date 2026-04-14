import { useEffect } from 'react'
import styles from './CaseModal.module.css'

export default function CaseModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

  if (!item) return null

  const paragraphs = item.body.split('\n\n')

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.header}>
          <span className={styles.tag}>Case</span>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 className={styles.title}>{item.title}</h2>

        <p className={styles.abstract}>{item.abstract}</p>

        <div className={styles.divider} />

        <div className={styles.body}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

      </div>
    </div>
  )
}
