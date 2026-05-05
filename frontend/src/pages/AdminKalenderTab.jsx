import { useState, useEffect } from 'react'
import styles from './AdminPage.module.css'

function fmtDate(tsMs) {
  if (!tsMs) return '—'
  return new Date(tsMs).toLocaleString('nb-NO', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function tsToDatetimeLocal(tsMs) {
  if (!tsMs) return ''
  const d   = new Date(tsMs)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function datetimeLocalToTs(val) {
  if (!val) return null
  return new Date(val).getTime()
}

const EMPTY_FORM = { title: '', event_date: '', type: 'online', location: '', link: '', description: '', reveal_at: '' }

function getStatus(event, now) {
  if (event.cancelled === 1) return 'Avlyst'
  if (event.event_date < now) return 'Passert'
  return 'Kommende'
}

export default function AdminKalenderTab() {
  const [events, setEvents]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editing, setEditing]         = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function fetchEvents() {
    setLoading(true)
    const res  = await fetch('/api/admin/events')
    const data = await res.json()
    setEvents(data)
    setLoading(false)
  }

  useEffect(() => { fetchEvents() }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(ev) {
    setEditing(ev)
    setForm({
      title:       ev.title,
      event_date:  tsToDatetimeLocal(ev.event_date),
      type:        ev.type,
      location:    ev.location    || '',
      link:        ev.link        || '',
      description: ev.description || '',
      reveal_at:   tsToDatetimeLocal(ev.reveal_at),
    })
    setShowForm(true)
  }

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.event_date) return
    setSaving(true)
    const body = {
      title:       form.title.trim(),
      event_date:  datetimeLocalToTs(form.event_date),
      type:        form.type,
      location:    form.location    || null,
      link:        form.link        || null,
      description: form.description || null,
      reveal_at:   form.reveal_at ? datetimeLocalToTs(form.reveal_at) : null,
    }
    if (editing) {
      await fetch(`/api/admin/events/${editing.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    } else {
      await fetch('/api/admin/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
    }
    setSaving(false)
    setShowForm(false)
    fetchEvents()
  }

  async function handleCancelToggle(ev) {
    const cancel = ev.cancelled !== 1
    await fetch(`/api/admin/events/${ev.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cancel }),
    })
    fetchEvents()
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    fetchEvents()
  }

  const now = Date.now()

  return (
    <div className={styles.kalenderTab}>

      <div className={styles.kalenderToolbar}>
        <div className={styles.tipsSectionLabel}>Hendelser</div>
        <button className={styles.tipsAddBtn} onClick={openCreate}>Ny hendelse</button>
      </div>

      {loading ? (
        <div className={styles.empty}>Laster…</div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>Ingen hendelser ennå. Opprett den første.</div>
      ) : (
        <div className={styles.eventAdminList}>
          {events.map(ev => {
            const status = getStatus(ev, now)
            return (
              <div key={ev.id} className={styles.eventAdminRow}>
                <div className={styles.eventAdminLeft}>
                  <div className={styles.eventAdminTitle}>{ev.title}</div>
                  <div className={styles.eventAdminMeta}>
                    {fmtDate(ev.event_date)}
                    {ev.location ? ` · ${ev.location}` : ''}
                    {ev.type === 'online' ? ' · Online' : ' · Fysisk'}
                  </div>
                </div>
                <div className={styles.eventAdminRight}>
                  <span className={`${styles.badge} ${
                    status === 'Kommende' ? styles.badgeMember :
                    status === 'Avlyst'   ? styles.badgeDanger :
                    styles.badgeNone
                  }`}>{status}</span>
                  <button className={styles.btn} onClick={() => openEdit(ev)}>Rediger</button>
                  <button
                    className={`${styles.btn} ${ev.cancelled === 1 ? '' : styles.btnMuted}`}
                    onClick={() => handleCancelToggle(ev)}
                  >
                    {ev.cancelled === 1 ? 'Gjenopprett' : 'Avlys'}
                  </button>
                  <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => setConfirmDelete(ev)}>
                    Slett
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className={styles.kalenderForm}>
            <div className={styles.kalenderFormHeader}>
              <h3 className={styles.kalenderFormTitle}>{editing ? 'Rediger hendelse' : 'Ny hendelse'}</h3>
              <button className={styles.btn} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <label className={styles.formLabel}>Tittel *</label>
            <input
              className={styles.formInput}
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              placeholder="Tittel på arrangementet"
            />

            <label className={styles.formLabel}>Dato og tid *</label>
            <input
              className={styles.formInput}
              type="datetime-local"
              value={form.event_date}
              onChange={e => setField('event_date', e.target.value)}
            />

            <label className={styles.formLabel}>Type</label>
            <select
              className={styles.formSelect}
              value={form.type}
              onChange={e => setField('type', e.target.value)}
            >
              <option value="online">Online</option>
              <option value="fysisk">Fysisk</option>
            </select>

            <label className={styles.formLabel}>Sted</label>
            <input
              className={styles.formInput}
              value={form.location}
              onChange={e => setField('location', e.target.value)}
              placeholder="Sted (valgfritt)"
            />

            <label className={styles.formLabel}>Lenke</label>
            <input
              className={styles.formInput}
              value={form.link}
              onChange={e => setField('link', e.target.value)}
              placeholder="https://… (valgfritt)"
            />

            <label className={styles.formLabel}>Beskrivelse</label>
            <textarea
              className={styles.tipsTextarea}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="Beskrivelse av arrangementet (valgfritt)"
              rows={3}
            />

            <label className={styles.formLabel}>Vis sted og lenke fra</label>
            <input
              className={styles.formInput}
              type="datetime-local"
              value={form.reveal_at}
              onChange={e => setField('reveal_at', e.target.value)}
            />
            <div className={styles.formHint}>La stå tom for å vise sted/lenke med en gang.</div>

            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setShowForm(false)} disabled={saving}>Avbryt</button>
              <button
                className={styles.tipsAddBtn}
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.event_date}
              >
                {saving ? 'Lagrer…' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
          <div className={styles.kalenderConfirm}>
            <p className={styles.kalenderConfirmText}>
              Slett «{confirmDelete.title}»? Dette kan ikke angres.
            </p>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setConfirmDelete(null)}>Avbryt</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(confirmDelete.id)}>
                Slett
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
