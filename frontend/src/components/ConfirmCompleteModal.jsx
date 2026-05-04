import { useEffect } from 'react'
import styles from './ConfirmCompleteModal.module.css'

export default function ConfirmCompleteModal({ item, onConfirm, onClose }) {
  useEffect(() => {
    if (!item) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

  if (!item) return null

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <span className={styles.tag}>Fullføre</span>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className={styles.body}>
          Vil du markere <strong>«{item.title}»</strong> som fullført?
        </p>
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>Avbryt</button>
          <button className={styles.btnPrimary} onClick={() => { onConfirm(); onClose() }}>
            Ja, merk fullført
          </button>
        </div>
      </div>
    </div>
  )
}
