import { useState, useEffect, useCallback } from 'react'
import styles from './AdminPage.module.css'
import { CardIcon, CARD_ICON_KEYS, CARD_ICON_LABELS } from '../components/CardIcons'

// ─── Inline icons ─────────────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function BanIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function fmtEventDate(tsMs) {
  if (!tsMs) return ''
  return new Date(tsMs).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' }) +
    ' · ' + new Date(tsMs).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
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

function truncate(str, max = 100) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str
}

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type, cancelled }) {
  if (cancelled === 1) return <span className={`${styles.kalTypeBadge} ${styles.kalTypeBadgeCancelled}`}>Avlyst</span>
  return (
    <span className={`${styles.kalTypeBadge} ${type === 'online' ? styles.kalTypeBadgeOnline : styles.kalTypeBadgeFysisk}`}>
      {type === 'online' ? 'Online' : 'Fysisk'}
    </span>
  )
}

// ─── Admin event card ─────────────────────────────────────────────────────────

function AdminEventCard({ ev, onEdit, onToggleCancel, onDelete }) {
  return (
    <div className={`${styles.kalenderAdminCard} ${styles.kalenderAdminEventCard}`}>
      <div className={styles.kalenderCardBadgeRow}>
        <TypeBadge type={ev.type} cancelled={ev.cancelled} />
      </div>
      <div className={styles.kalenderCardTitle}>{ev.title}</div>
      <div className={styles.kalenderCardMeta}>{fmtEventDate(ev.event_date)}</div>
      {ev.location && <div className={styles.kalenderCardLoc}>{ev.location}</div>}
      {ev.description && <div className={styles.kalenderCardDesc}>{truncate(ev.description)}</div>}

      <div className={styles.kalenderCardOverlay}>
        <button className={styles.kalenderCardOverlayBtn} onClick={onEdit} title="Rediger"><PencilIcon /></button>
        <button className={styles.kalenderCardOverlayBtn} onClick={onToggleCancel} title={ev.cancelled ? 'Gjenopprett' : 'Avlys'}>
          {ev.cancelled ? <UndoIcon /> : <BanIcon />}
        </button>
        <button className={`${styles.kalenderCardOverlayBtn} ${styles.kalenderCardOverlayBtnDanger}`} onClick={onDelete} title="Slett"><TrashIcon /></button>
      </div>
    </div>
  )
}

// ─── Admin section card ───────────────────────────────────────────────────────

function AdminSectionCard({ card, onEdit, onDelete }) {
  return (
    <div className={styles.kalenderAdminCard}>
      <div className={styles.kalenderCardIconWrap}><CardIcon name={card.icon} /></div>
      <div className={styles.kalenderCardTitle}>{card.title}</div>
      {card.description && <div className={styles.kalenderCardDesc}>{truncate(card.description, 80)}</div>}
      {card.link_label && <div className={styles.kalenderCardLink}>{card.link_label} →</div>}

      <div className={styles.kalenderCardOverlay}>
        <button className={styles.kalenderCardOverlayBtn} onClick={onEdit} title="Rediger"><PencilIcon /></button>
        <button className={`${styles.kalenderCardOverlayBtn} ${styles.kalenderCardOverlayBtnDanger}`} onClick={onDelete} title="Slett"><TrashIcon /></button>
      </div>
    </div>
  )
}

// ─── Empty add card ───────────────────────────────────────────────────────────

function AddCard({ label, onClick, disabled = false }) {
  return (
    <button className={styles.kalenderAddCard} onClick={onClick} disabled={disabled}>
      <span className={styles.kalenderAddCardPlus}>+</span>
      <span className={styles.kalenderAddCardLabel}>{label}</span>
    </button>
  )
}

// ─── Form constants ───────────────────────────────────────────────────────────

const EMPTY_EVENT = { title: '', event_date: '', type: 'online', location: '', link: '', description: '', reveal_at: '' }
const EMPTY_CARD  = { section: 'fordypning', icon: 'user', title: '', description: '', link: '', link_label: '' }

// ─── Tab ─────────────────────────────────────────────────────────────────────

export default function AdminKalenderTab() {
  const [events, setEvents]             = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [cards, setCards]               = useState([])
  const [cardsLoading, setCardsLoading] = useState(true)

  // Event form
  const [showEventForm, setShowEventForm]   = useState(false)
  const [editingEvent, setEditingEvent]     = useState(null)
  const [eventForm, setEventForm]           = useState(EMPTY_EVENT)
  const [savingEvent, setSavingEvent]       = useState(false)
  const [confirmDeleteEv, setConfirmDeleteEv] = useState(null)

  // Card form
  const [showCardForm, setShowCardForm]     = useState(false)
  const [editingCard, setEditingCard]       = useState(null)
  const [cardForm, setCardForm]             = useState(EMPTY_CARD)
  const [savingCard, setSavingCard]         = useState(false)
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(null)

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true)
    const res  = await fetch('/api/admin/events')
    setEvents(await res.json())
    setEventsLoading(false)
  }, [])

  const fetchCards = useCallback(async () => {
    setCardsLoading(true)
    const res  = await fetch('/api/admin/section-cards')
    setCards(await res.json())
    setCardsLoading(false)
  }, [])

  useEffect(() => { fetchEvents(); fetchCards() }, [fetchEvents, fetchCards])

  // ── Event helpers ────────────────────────────────────────────────────────

  function openCreateEvent() {
    setEditingEvent(null)
    setEventForm(EMPTY_EVENT)
    setShowEventForm(true)
  }

  function openEditEvent(ev) {
    setEditingEvent(ev)
    setEventForm({
      title:       ev.title,
      event_date:  tsToDatetimeLocal(ev.event_date),
      type:        ev.type,
      location:    ev.location    || '',
      link:        ev.link        || '',
      description: ev.description || '',
      reveal_at:   tsToDatetimeLocal(ev.reveal_at),
    })
    setShowEventForm(true)
  }

  async function saveEvent() {
    if (!eventForm.title.trim() || !eventForm.event_date) return
    setSavingEvent(true)
    const body = {
      title:       eventForm.title.trim(),
      event_date:  datetimeLocalToTs(eventForm.event_date),
      type:        eventForm.type,
      location:    eventForm.location    || null,
      link:        eventForm.link        || null,
      description: eventForm.description || null,
      reveal_at:   eventForm.reveal_at ? datetimeLocalToTs(eventForm.reveal_at) : null,
    }
    const url    = editingEvent ? `/api/admin/events/${editingEvent.id}` : '/api/admin/events'
    const method = editingEvent ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSavingEvent(false)
    setShowEventForm(false)
    fetchEvents()
  }

  async function toggleCancelEvent(ev) {
    await fetch(`/api/admin/events/${ev.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cancel: ev.cancelled !== 1 }),
    })
    fetchEvents()
  }

  async function deleteEvent(id) {
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    setConfirmDeleteEv(null)
    fetchEvents()
  }

  // ── Card helpers ─────────────────────────────────────────────────────────

  function openCreateCard(section) {
    setEditingCard(null)
    setCardForm({ ...EMPTY_CARD, section })
    setShowCardForm(true)
  }

  function openEditCard(card) {
    setEditingCard(card)
    setCardForm({
      section:    card.section,
      icon:       card.icon       || 'info',
      title:      card.title,
      description: card.description || '',
      link:       card.link       || '',
      link_label: card.link_label || '',
    })
    setShowCardForm(true)
  }

  async function saveCard() {
    if (!cardForm.title.trim()) return
    setSavingCard(true)
    const body = {
      section:     cardForm.section,
      icon:        cardForm.icon,
      title:       cardForm.title.trim(),
      description: cardForm.description || null,
      link:        cardForm.link        || null,
      link_label:  cardForm.link_label  || null,
    }
    const url    = editingCard ? `/api/admin/section-cards/${editingCard.id}` : '/api/admin/section-cards'
    const method = editingCard ? 'PATCH' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSavingCard(false)
    setShowCardForm(false)
    fetchCards()
  }

  async function deleteCard(id) {
    await fetch(`/api/admin/section-cards/${id}`, { method: 'DELETE' })
    setConfirmDeleteCard(null)
    fetchCards()
  }

  // ── Derived ──────────────────────────────────────────────────────────────

  const now           = Date.now()
  const upcomingEvents = events.filter(ev => ev.cancelled !== 1 ? ev.event_date >= now - 3_600_000 : ev.event_date > now)
  const fordypningCards = cards.filter(c => c.section === 'fordypning')
  const urskolenCards   = cards.filter(c => c.section === 'uroskolen')

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={styles.kalenderTab}>

      {/* ─── Kurs section ── */}
      <div className={styles.kalenderSec}>
        <div className={styles.kalenderSecHead}>
          <span className={styles.kalenderSecLabel}>Kurs</span>
          <button className={styles.tipsAddBtn} onClick={openCreateEvent}>+ Ny hendelse</button>
        </div>

        {eventsLoading ? (
          <div className={styles.empty}>Laster…</div>
        ) : (
          <div className={styles.kalenderScrollRow}>
            {upcomingEvents.map(ev => (
              <AdminEventCard
                key={ev.id}
                ev={ev}
                onEdit={() => openEditEvent(ev)}
                onToggleCancel={() => toggleCancelEvent(ev)}
                onDelete={() => setConfirmDeleteEv(ev)}
              />
            ))}
            <AddCard label="Ny hendelse" onClick={openCreateEvent} />
          </div>
        )}
      </div>

      <div className={styles.kalenderDivider} />

      {/* ─── Urofordypning section ── */}
      <div className={styles.kalenderSec}>
        <div className={styles.kalenderSecHead}>
          <span className={styles.kalenderSecLabel}>Urofordypning</span>
          <button className={styles.tipsAddBtn} onClick={() => openCreateCard('fordypning')} disabled={fordypningCards.length >= 2}>+ Nytt kort</button>
        </div>

        {cardsLoading ? (
          <div className={styles.empty}>Laster…</div>
        ) : (
          <div className={styles.kalenderScrollRow}>
            {fordypningCards.map(card => (
              <AdminSectionCard
                key={card.id}
                card={card}
                onEdit={() => openEditCard(card)}
                onDelete={() => setConfirmDeleteCard(card)}
              />
            ))}
            <AddCard label="Nytt kort" onClick={() => openCreateCard('fordypning')} disabled={fordypningCards.length >= 2} />
          </div>
        )}
      </div>

      <div className={styles.kalenderDivider} />

      {/* ─── Uro-skolen section ── */}
      <div className={styles.kalenderSec}>
        <div className={styles.kalenderSecHead}>
          <span className={styles.kalenderSecLabel}>Uro-skolen</span>
          <button className={styles.tipsAddBtn} onClick={() => openCreateCard('uroskolen')} disabled={urskolenCards.length >= 2}>+ Nytt kort</button>
        </div>

        {cardsLoading ? (
          <div className={styles.empty}>Laster…</div>
        ) : (
          <div className={styles.kalenderScrollRow}>
            {urskolenCards.map(card => (
              <AdminSectionCard
                key={card.id}
                card={card}
                onEdit={() => openEditCard(card)}
                onDelete={() => setConfirmDeleteCard(card)}
              />
            ))}
            <AddCard label="Nytt kort" onClick={() => openCreateCard('uroskolen')} disabled={urskolenCards.length >= 2} />
          </div>
        )}
      </div>

      {/* ─── Event form modal ── */}
      {showEventForm && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setShowEventForm(false)}>
          <div className={styles.kalenderForm}>
            <div className={styles.kalenderFormHeader}>
              <h3 className={styles.kalenderFormTitle}>{editingEvent ? 'Rediger hendelse' : 'Ny hendelse'}</h3>
              <button className={styles.btn} onClick={() => setShowEventForm(false)}><CloseIcon /></button>
            </div>

            <label className={styles.formLabel}>Tittel *</label>
            <input className={styles.formInput} value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} placeholder="Tittel på arrangementet" />

            <label className={styles.formLabel}>Dato og tid *</label>
            <input className={styles.formInput} type="datetime-local" value={eventForm.event_date} onChange={e => setEventForm(f => ({ ...f, event_date: e.target.value }))} />

            <label className={styles.formLabel}>Type</label>
            <select className={styles.formSelect} value={eventForm.type} onChange={e => setEventForm(f => ({ ...f, type: e.target.value }))}>
              <option value="online">Online</option>
              <option value="fysisk">Fysisk</option>
            </select>

            <label className={styles.formLabel}>Sted</label>
            <input className={styles.formInput} value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} placeholder="Sted (valgfritt)" />

            <label className={styles.formLabel}>Lenke</label>
            <input className={styles.formInput} value={eventForm.link} onChange={e => setEventForm(f => ({ ...f, link: e.target.value }))} placeholder="https://… (valgfritt)" />

            <label className={styles.formLabel}>Beskrivelse</label>
            <textarea className={styles.tipsTextarea} value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} placeholder="Beskrivelse (valgfritt)" rows={3} />

            <label className={styles.formLabel}>Vis sted og lenke fra</label>
            <input className={styles.formInput} type="datetime-local" value={eventForm.reveal_at} onChange={e => setEventForm(f => ({ ...f, reveal_at: e.target.value }))} />
            <div className={styles.formHint}>La stå tom for å vise sted/lenke med en gang.</div>

            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setShowEventForm(false)} disabled={savingEvent}>Avbryt</button>
              <button className={styles.tipsAddBtn} onClick={saveEvent} disabled={savingEvent || !eventForm.title.trim() || !eventForm.event_date}>
                {savingEvent ? 'Lagrer…' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Card form modal ── */}
      {showCardForm && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setShowCardForm(false)}>
          <div className={styles.kalenderForm}>
            <div className={styles.kalenderFormHeader}>
              <h3 className={styles.kalenderFormTitle}>{editingCard ? 'Rediger kort' : 'Nytt kort'}</h3>
              <button className={styles.btn} onClick={() => setShowCardForm(false)}><CloseIcon /></button>
            </div>

            <label className={styles.formLabel}>Ikon</label>
            <div className={styles.kalenderIconGrid}>
              {CARD_ICON_KEYS.map(key => (
                <button
                  key={key}
                  title={CARD_ICON_LABELS[key]}
                  className={`${styles.kalenderIconOption} ${cardForm.icon === key ? styles.kalenderIconOptionActive : ''}`}
                  onClick={() => setCardForm(f => ({ ...f, icon: key }))}
                >
                  <CardIcon name={key} size={16} />
                </button>
              ))}
            </div>

            <label className={styles.formLabel}>Seksjon</label>
            <select className={styles.formSelect} value={cardForm.section} onChange={e => setCardForm(f => ({ ...f, section: e.target.value }))}>
              <option value="fordypning">Urofordypning</option>
              <option value="uroskolen">Uro-skolen</option>
            </select>

            <label className={styles.formLabel}>Tittel *</label>
            <input className={styles.formInput} value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))} placeholder="Korttittel" />

            <label className={styles.formLabel}>Beskrivelse</label>
            <textarea className={styles.tipsTextarea} value={cardForm.description} onChange={e => setCardForm(f => ({ ...f, description: e.target.value }))} placeholder="Kortbeskrivelse (valgfritt)" rows={2} />

            <label className={styles.formLabel}>Lenke</label>
            <input className={styles.formInput} value={cardForm.link} onChange={e => setCardForm(f => ({ ...f, link: e.target.value }))} placeholder="https://… (valgfritt)" />

            {cardForm.link && (
              <>
                <label className={styles.formLabel}>Lenke-tekst</label>
                <input className={styles.formInput} value={cardForm.link_label} onChange={e => setCardForm(f => ({ ...f, link_label: e.target.value }))} placeholder="f.eks. Les mer, Book time…" />
              </>
            )}

            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setShowCardForm(false)} disabled={savingCard}>Avbryt</button>
              <button className={styles.tipsAddBtn} onClick={saveCard} disabled={savingCard || !cardForm.title.trim()}>
                {savingCard ? 'Lagrer…' : 'Lagre'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm delete event ── */}
      {confirmDeleteEv && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setConfirmDeleteEv(null)}>
          <div className={styles.kalenderConfirm}>
            <p className={styles.kalenderConfirmText}>Slett «{confirmDeleteEv.title}»? Dette kan ikke angres.</p>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setConfirmDeleteEv(null)}>Avbryt</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deleteEvent(confirmDeleteEv.id)}>Slett</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm delete card ── */}
      {confirmDeleteCard && (
        <div className={styles.kalenderOverlay} onClick={e => e.target === e.currentTarget && setConfirmDeleteCard(null)}>
          <div className={styles.kalenderConfirm}>
            <p className={styles.kalenderConfirmText}>Slett «{confirmDeleteCard.title}»? Dette kan ikke angres.</p>
            <div className={styles.formActions}>
              <button className={styles.btn} onClick={() => setConfirmDeleteCard(null)}>Avbryt</button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => deleteCard(confirmDeleteCard.id)}>Slett</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
