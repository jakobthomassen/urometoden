import { useEffect } from 'react'
import styles from './AudioModal.module.css'

export default function AudioModal({ item, onClose, onPlay }) {
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
          <span className={styles.tag}>Lydfil</span>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 className={styles.title}>{item.title}</h2>

        {item.abstract && <p className={styles.descriptor}>{item.abstract}</p>}

        <div className={styles.metaRow}>
          {item.meta && <span className={styles.duration}>{item.meta}</span>}
          {item.weeks?.map(w => (
            <span key={w} className={styles.weekChip}>Uke {w}</span>
          ))}
        </div>

        {item.body && (
          <>
            <div className={styles.divider} />
            <div className={styles.body}>
              {item.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </>
        )}

        <div className={styles.footer}>
          <button
            className={styles.listenBtn}
            onClick={() => onPlay(item)}
            disabled={!item.r2_key}
          >
            Lytt
          </button>
        </div>

      </div>
    </div>
  )
}
