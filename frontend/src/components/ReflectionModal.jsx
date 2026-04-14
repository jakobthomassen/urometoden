import { useState, useEffect, useRef } from 'react'
import styles from './ReflectionModal.module.css'

const STORAGE_KEY = (id) => `reflection_${id}`

export default function ReflectionModal({ item, onClose }) {
  const [text, setText] = useState('')
  const [saved, setSaved] = useState(false)
  const textareaRef = useRef(null)

  // Load saved text when item changes
  useEffect(() => {
    if (!item) return
    setText(localStorage.getItem(STORAGE_KEY(item.id)) ?? '')
    setSaved(false)
    // Focus textarea after transition
    const t = setTimeout(() => textareaRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [item?.id])

  // ESC to close
  useEffect(() => {
    if (!item) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [item, onClose])

  function handleSave() {
    localStorage.setItem(STORAGE_KEY(item.id), text)
    setSaved(true)
  }

  if (!item) return null

  const paragraphs = item.prompt.split('\n\n')

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.header}>
          <span className={styles.tag}>Refleksjon</span>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <h2 className={styles.title}>{item.title}</h2>

        <div className={styles.prompt}>
          {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className={styles.divider} />

        <label className={styles.inputLabel}>Dine tanker</label>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="Skriv fritt her…"
          value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false) }}
          rows={6}
        />

        <div className={styles.footer}>
          <span className={styles.savedMsg} data-visible={saved}>
            Lagret
          </span>
          <button className={styles.saveBtn} onClick={handleSave}>
            Lagre
          </button>
        </div>

      </div>
    </div>
  )
}
