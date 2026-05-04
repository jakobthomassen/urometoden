import { useEffect } from 'react'
import styles from './CongratsModal.module.css'

function formatUnlockDate(unlockAt) {
  if (!unlockAt) return null
  const day  = unlockAt.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${day} kl. 10:00`
}

export default function CongratsModal({ open, weekId, nextWeek, onClose, onNavigate }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  const locked     = nextWeek?.status === 'locked'
  const unlockDate = formatUnlockDate(nextWeek?.unlockAt)

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.hero}>
          <div className={styles.checkCircle}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 14 11 20 23 8" />
            </svg>
          </div>
          <h2 className={styles.heading}>Uke {weekId} fullført</h2>
          <p className={styles.sub}>Du har fullført alle modulene for denne uken.</p>
        </div>

        <div className={styles.divider} />

        {nextWeek && (
          <div className={styles.nextSection}>
            {locked ? (
              <>
                <div className={styles.nextLabel}>Neste uke</div>
                <div className={styles.nextTitle}>Uke {nextWeek.id} – {nextWeek.title}</div>
                <div className={styles.lockRow}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>
                    {unlockDate
                      ? <>Låses opp <strong>{unlockDate}</strong></>
                      : 'Låses opp om noen dager'
                    }
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className={`${styles.nextLabel} ${styles.nextLabelReady}`}>Neste uke er klar</div>
                <div className={styles.nextTitle}>Uke {nextWeek.id} – {nextWeek.title}</div>
                {nextWeek.description && <div className={styles.nextDesc}>{nextWeek.description}</div>}
                <button
                  className={styles.goBtn}
                  onClick={() => { onNavigate(nextWeek.id); onClose() }}
                >
                  Gå til uke {nextWeek.id} →
                </button>
              </>
            )}
          </div>
        )}

        <button className={styles.dismissBtn} onClick={onClose}>Lukk</button>

      </div>
    </div>
  )
}
