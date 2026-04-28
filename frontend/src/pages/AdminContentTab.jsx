import { useState, useEffect, useCallback } from 'react'
import styles from './AdminContentTab.module.css'

// ─── Constants ──────────────────────────────────────────────────────────────

const TYPES = [
  {
    type:  'audio',
    icon:  '♪',
    label: 'Lydfil',
    desc:  'Guidet lydøkt — vises øverst i uken',
  },
  {
    type:  'video',
    icon:  '▷',
    label: 'Video',
    desc:  'Kort forklaringsvideo',
  },
  {
    type:  'case',
    icon:  '◎',
    label: 'Case',
    desc:  'Leseoppgave med virkelige eksempler',
  },
  {
    type:  'reflect',
    icon:  '✎',
    label: 'Refleksjon',
    desc:  'Spørsmål brukeren skriver svar på',
  },
]

const TYPE_LABEL = { audio: 'Lyd', video: 'Video', case: 'Case', reflect: 'Refleksjon' }

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(type, title) {
  const slug = title.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').slice(0, 40)
  return slug ? `${type}-${slug}` : type
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDuration(secs) {
  const m = Math.floor(secs / 60)
  const s = Math.round(secs % 60)
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function loadAudioDuration(key) {
  return new Promise(resolve => {
    const audio = new Audio(`/api/audio/${key}`)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => resolve(audio.duration)
    audio.onerror = () => resolve(null)
  })
}

function emptyForm(type) {
  return { id: '', type, title: '', meta: '', r2_key: '', abstract: '', body: '', prompt: '', weeks: [] }
}

// ─── TypeSelector ───────────────────────────────────────────────────────────

function TypeSelector({ onSelect }) {
  return (
    <div className={styles.typeGrid}>
      {TYPES.map(t => (
        <button
          key={t.type}
          className={`${styles.typeCard} ${styles[`typeCard_${t.type}`]}`}
          onClick={() => onSelect(t.type)}
        >
          <span className={`${styles.typeCardIcon} ${styles[`typeIcon_${t.type}`]}`}>{t.icon}</span>
          <span className={styles.typeCardLabel}>{t.label}</span>
          <span className={styles.typeCardDesc}>{t.desc}</span>
        </button>
      ))}
    </div>
  )
}

// ─── WeekPicker ─────────────────────────────────────────────────────────────

function WeekPicker({ value = [], onChange }) {
  function toggle(n) {
    const has = value.find(w => w.week_id === n)
    if (has) onChange(value.filter(w => w.week_id !== n))
    else     onChange([...value, { week_id: n, position: 0 }].sort((a, b) => a.week_id - b.week_id))
  }
  function setPos(n, pos) {
    onChange(value.map(w => w.week_id === n ? { ...w, position: parseInt(pos) || 0 } : w))
  }

  return (
    <div className={styles.weekPicker}>
      {Array.from({ length: 8 }, (_, i) => i + 1).map(n => {
        const active = value.find(w => w.week_id === n)
        return (
          <div key={n} className={`${styles.weekChip} ${active ? styles.weekChipActive : ''}`}>
            <button type="button" className={styles.weekChipBtn} onClick={() => toggle(n)}>
              {active ? '✓ ' : ''}Uke {n}
            </button>
            {active && (
              <input
                type="number"
                min="0"
                className={styles.weekChipPos}
                value={active.position}
                onChange={e => setPos(n, e.target.value)}
                title="Posisjon i uke"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── FilePicker ─────────────────────────────────────────────────────────────

function FilePicker({ currentKey, onSelect, onClose }) {
  const [files, setFiles]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    const url = currentKey
      ? `/api/admin/bucket?exclude=${encodeURIComponent(currentKey)}`
      : '/api/admin/bucket'
    fetch(url).then(r => r.json()).then(data => { setFiles(data); setLoading(false) })
  }, [currentKey])

  const filtered = search
    ? files.filter(f => f.key.toLowerCase().includes(search.toLowerCase()))
    : files

  return (
    <div className={styles.pickerOverlay}>
      <div className={styles.pickerPanel}>
        <div className={styles.pickerHeader}>
          <span className={styles.pickerTitle}>Velg fil fra bucket</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.pickerSearch}>
          <input
            className={styles.pickerSearchInput}
            placeholder="Filtrer filer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className={styles.pickerList}>
          {loading
            ? <div className={styles.pickerEmpty}>Laster…</div>
            : filtered.length === 0
              ? <div className={styles.pickerEmpty}>Ingen filer funnet.</div>
              : filtered.map(f => (
                <button
                  key={f.key}
                  className={`${styles.pickerFile} ${f.inUse ? styles.pickerFileUsed : ''}`}
                  disabled={f.inUse}
                  onClick={() => onSelect(f.key)}
                >
                  <span className={styles.pickerFileName}>{f.key}</span>
                  <span className={styles.pickerFileMeta}>
                    {formatSize(f.size)}
                    {f.inUse && <span className={styles.inUseBadge}>I bruk</span>}
                  </span>
                </button>
              ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── ContentForm ────────────────────────────────────────────────────────────

function ContentForm({ initial, onSave, onCancel, saving, error }) {
  const [form, setForm]             = useState(initial)
  const [idEdited, setIdEdited]     = useState(!!initial.id)
  const [showPicker, setShowPicker] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auto-generate ID from title for new items
  useEffect(() => {
    if (!idEdited && form.title) set('id', generateId(form.type, form.title))
  }, [form.title, idEdited, form.type])

  const needsFile = form.type === 'audio' || form.type === 'video'
  const typeInfo  = TYPES.find(t => t.type === form.type)

  const canSave = form.title.trim() && form.id.trim()

  return (
    <>
      <div className={styles.formBody}>

        <div className={styles.formTypeChip}>
          <span className={`${styles.typeBadge} ${styles[`typeBadge_${form.type}`]}`}>
            {typeInfo?.icon} {typeInfo?.label}
          </span>
          <span className={styles.typeHint}>{typeInfo?.desc}</span>
        </div>

        {/* Title */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Tittel *</label>
          <input
            className={styles.input}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder='F.eks. «Rolig pust»'
          />
        </div>

        {/* ID */}
        <div className={styles.field}>
          <label className={styles.fieldLabel}>ID *</label>
          <input
            className={styles.input}
            value={form.id}
            onChange={e => { setIdEdited(true); set('id', e.target.value) }}
            placeholder="audio-rolig-pust"
          />
          <span className={styles.fieldHint}>Unik nøkkel. Auto-generert fra tittel — endre kun ved behov.</span>
        </div>

        {/* Meta — duration/subtitle for audio, video, case */}
        {(needsFile || form.type === 'case') && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {needsFile ? 'Varighet' : 'Undertittel'}
              <span className={styles.optional}> (valgfri)</span>
            </label>
            <input
              className={styles.input}
              value={form.meta}
              onChange={e => set('meta', e.target.value)}
              placeholder={needsFile ? '18 min' : 'F.eks. «Jobbangst»'}
            />
          </div>
        )}

        {/* Abstract — all except reflect */}
        {form.type !== 'reflect' && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Sammendrag
              <span className={styles.optional}> (vises på kortet)</span>
            </label>
            <textarea
              className={styles.textarea}
              value={form.abstract}
              onChange={e => set('abstract', e.target.value)}
              rows={2}
              placeholder="Kort beskrivelse som vises i kortvisning…"
            />
          </div>
        )}

        {/* Body — case and audio */}
        {(form.type === 'case' || form.type === 'audio') && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {form.type === 'audio' ? <>Beskrivelse<span className={styles.optional}> (valgfri)</span></> : 'Tekst *'}
            </label>
            <textarea
              className={styles.textarea}
              value={form.body}
              onChange={e => set('body', e.target.value)}
              rows={form.type === 'audio' ? 4 : 10}
              placeholder={form.type === 'audio'
                ? 'Lengre beskrivelse som vises i popup-visningen…'
                : 'Skriv inn caseteksten. Avsnitt skilles med tom linje.'}
            />
          </div>
        )}

        {/* Prompt — reflect only */}
        {form.type === 'reflect' && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Refleksjonsspørsmål *</label>
            <textarea
              className={styles.textarea}
              value={form.prompt}
              onChange={e => set('prompt', e.target.value)}
              rows={3}
              placeholder="Spørsmålet brukeren skal reflektere over…"
            />
            <span className={styles.fieldHint}>Vises i refleksjonsmodalen som det stilte spørsmålet.</span>
          </div>
        )}

        {/* File picker — audio and video */}
        {needsFile && (
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              {form.type === 'audio' ? 'Lydfil' : 'Videofil'} *
            </label>
            <div className={styles.fileRow}>
              {form.r2_key
                ? <span className={styles.fileSelected}>{form.r2_key}</span>
                : <span className={styles.fileNone}>Ingen fil valgt</span>
              }
              <button type="button" className={styles.fileBtn} onClick={() => setShowPicker(true)}>
                {form.r2_key ? 'Bytt fil' : 'Velg fil…'}
              </button>
              {form.r2_key && (
                <button type="button" className={styles.fileClear} onClick={() => set('r2_key', '')}>✕</button>
              )}
            </div>
          </div>
        )}

        {/* Week assignment */}
        <div className={styles.fieldDivider} />
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Ukestilordning</label>
          <span className={styles.fieldHint}>Velg hvilke uker dette innholdet skal vises i, og posisjonen det havner på.</span>
          <WeekPicker value={form.weeks} onChange={w => set('weeks', w)} />
        </div>

        {error && <div className={styles.formError}>{error}</div>}

      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={onCancel}>Avbryt</button>
        <button
          className={styles.btnPrimary}
          onClick={() => onSave(form)}
          disabled={saving || !canSave}
        >
          {saving ? 'Lagrer…' : 'Lagre'}
        </button>
      </div>

      {showPicker && (
        <FilePicker
          currentKey={initial.r2_key}
          onSelect={async key => {
            set('r2_key', key)
            setShowPicker(false)
            if (form.type === 'audio') {
              const secs = await loadAudioDuration(key)
              if (secs) set('meta', formatDuration(secs))
            }
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

// ─── ContentModal ───────────────────────────────────────────────────────────

function ContentModal({ item, onSave, onClose }) {
  const [step, setStep]     = useState(item ? 'form' : 'type')
  const [type, setType]     = useState(item?.type || '')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleSave(form) {
    setSaving(true)
    setError('')
    try {
      const res = item
        ? await fetch(`/api/admin/content/${item.id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(form),
          })
        : await fetch('/api/admin/content', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(form),
          })

      if (res.status === 409) { setError('ID er allerede i bruk. Endre ID-feltet.'); setSaving(false); return }
      if (!res.ok)            { setError('Noe gikk galt. Prøv igjen.'); setSaving(false); return }

      onSave(await res.json())
    } catch {
      setError('Noe gikk galt.')
      setSaving(false)
    }
  }

  const title = step === 'type'
    ? 'Nytt innhold — velg type'
    : item
      ? `Rediger: ${item.title}`
      : `Ny ${TYPES.find(t => t.type === type)?.label ?? ''}`

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {step === 'type'
          ? (
            <div className={styles.modalBody}>
              <TypeSelector onSelect={t => { setType(t); setStep('form') }} />
            </div>
          )
          : (
            <ContentForm
              initial={item ? { ...item } : emptyForm(type)}
              onSave={handleSave}
              onCancel={onClose}
              saving={saving}
              error={error}
            />
          )
        }
      </div>
    </div>
  )
}

// ─── ContentRow ─────────────────────────────────────────────────────────────

function ContentRow({ item, onEdit, onDelete }) {
  const typeInfo = TYPES.find(t => t.type === item.type)
  return (
    <div className={styles.contentRow}>
      <div className={styles.rowLeft}>
        <span className={`${styles.typeBadge} ${styles[`typeBadge_${item.type}`]}`}>
          {typeInfo?.icon} {TYPE_LABEL[item.type]}
        </span>
        <div>
          <div className={styles.rowTitle}>{item.title}</div>
          <div className={styles.rowId}>{item.id}{item.r2_key ? ` · ${item.r2_key}` : ''}</div>
        </div>
      </div>
      <div className={styles.rowWeeks}>
        {item.weeks?.sort((a, b) => a.week_id - b.week_id).map(w => (
          <span key={w.week_id} className={styles.weekTag}>Uke {w.week_id}</span>
        ))}
      </div>
      <div className={styles.rowActions}>
        <button className={styles.btn} onClick={() => onEdit(item)}>Rediger</button>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onDelete(item.id)}>Slett</button>
      </div>
    </div>
  )
}

// ─── AdminContentTab ────────────────────────────────────────────────────────

export default function AdminContentTab() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [modal, setModal]     = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/content')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function handleDelete(id) {
    if (!confirm('Slette dette innholdet? Det fjernes fra alle uker og kan ikke gjenopprettes.')) return
    await fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function handleSave(saved) {
    setItems(prev => {
      const exists = prev.find(i => i.id === saved.id)
      return exists
        ? prev.map(i => i.id === saved.id ? saved : i)
        : [...prev, saved].sort((a, b) => a.type.localeCompare(b.type) || a.title.localeCompare(b.title))
    })
    setModal(null)
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)

  return (
    <div className={styles.tab}>
      <div className={styles.toolbar}>
        <div className={styles.typeFilter}>
          {['all', 'audio', 'video', 'case', 'reflect'].map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filter === t ? styles.filterActive : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? 'Alle' : TYPE_LABEL[t]}
              {t !== 'all' && <span className={styles.filterCount}>{items.filter(i => i.type === t).length}</span>}
            </button>
          ))}
        </div>
        <button className={styles.btnPrimary} onClick={() => setModal({ mode: 'create' })}>
          + Nytt innhold
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>Laster…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {filter === 'all'
            ? 'Ingen innholdsenheter ennå. Klikk «+ Nytt innhold» for å starte.'
            : `Ingen ${TYPE_LABEL[filter]?.toLowerCase()}-innhold.`}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(item => (
            <ContentRow
              key={item.id}
              item={item}
              onEdit={item => setModal({ mode: 'edit', item })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal && (
        <ContentModal
          item={modal.mode === 'edit' ? modal.item : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
