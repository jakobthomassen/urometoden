import { useState, useEffect } from 'react'
import styles from './ConsentModal.module.css'

export default function ConsentModal({ open, onConsent, onClose }) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (open) setChecked(false)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.header}>
          <span className={styles.tag}>Personvern</span>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 className={styles.title}>Lagring av refleksjonstekst</h2>

        <p className={styles.intro}>
          Før du skriver din første refleksjon trenger vi samtykke til å lagre svarene dine.
        </p>

        <details className={styles.accordion}>
          <summary className={styles.accordionSummary}>
            Hva lagrer vi og hvorfor?
            <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <div className={styles.accordionBody}>
            <p>
              Dine skriftlige refleksjoner kan inneholde sensitive personopplysninger om psykisk helse
              og er underlagt GDPR artikkel 9 (spesialkategorier av personopplysninger).
            </p>
            <p>
              Vi lagrer svarene dine utelukkende for at du skal ha tilgang til dem gjennom hele
              programmet. Dataene er kryptert under overføring (HTTPS) og lagret sikkert hos Cloudflare.
              Ingen tredjepart har tilgang.
            </p>
            <p>
              Du kan når som helst be om sletting av kontoen din og all tilknyttet data via
              kontoinnstillingene.
            </p>
          </div>
        </details>

        <label className={styles.checkLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
          />
          <span>
            Jeg samtykker til at mine skriftlige refleksjoner lagres i henhold til beskrivelsen ovenfor.
          </span>
        </label>

        <div className={styles.footer}>
          <button
            className={styles.okBtn}
            disabled={!checked}
            onClick={onConsent}
          >
            OK
          </button>
        </div>

      </div>
    </div>
  )
}
