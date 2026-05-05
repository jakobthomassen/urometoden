import { useState, useEffect } from 'react'
import styles from './KursPage.module.css'

// ─── Icons ───────────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  )
}

function CalendarDaysIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function fmtEventDate(tsMs) {
  if (!tsMs) return ''
  return new Date(tsMs).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtEventTime(tsMs) {
  if (!tsMs) return ''
  return new Date(tsMs).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
}

function truncate(str, max = 120) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max).trimEnd() + '…' : str
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function TypeBadge({ type, cancelled }) {
  if (cancelled === 1) return <span className={`${styles.typeBadge} ${styles.typeBadgeCancelled}`}>Avlyst</span>
  const isOnline = type === 'online'
  return (
    <span className={`${styles.typeBadge} ${isOnline ? styles.typeBadgeOnline : styles.typeBadgeFysisk}`}>
      {isOnline ? 'Online' : 'Fysisk'}
    </span>
  )
}

// ─── BookingModal ─────────────────────────────────────────────────────────────

function BookingModal({ onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Én-til-én veiledning</h2>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)"><CloseIcon /></button>
        </div>

        <p className={styles.modalText}>
          Book en personlig veiledningstime med en av våre veiledere — online eller fysisk.
          Du finner ledige tider og påmelding på urometoden.no.
        </p>

        <div className={styles.modalFooter}>
          <a href="https://www.urometoden.no/" target="_blank" rel="noopener noreferrer" className={styles.bookLink}>
            Gå til timebestilling →
          </a>
          <button className={styles.okBtn} onClick={onClose}>OK</button>
        </div>

      </div>
    </div>
  )
}

// ─── EventDetailModal ─────────────────────────────────────────────────────────

function EventDetailModal({ event, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.modalHeader}>
          <div className={styles.modalTitleGroup}>
            <div className={styles.badgeRow}>
              <TypeBadge type={event.type} />
              {event.cancelled === 1 && <span className={`${styles.typeBadge} ${styles.typeBadgeCancelled}`}>Avlyst</span>}
            </div>
            <h2 className={styles.modalTitle}>{event.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)"><CloseIcon /></button>
        </div>

        <div className={styles.eventDetailBody}>
          <div className={styles.eventDetailMeta}>
            {fmtEventDate(event.event_date)} · {fmtEventTime(event.event_date)}
          </div>

          {event.location && !event.reveal_pending && (
            <div className={styles.eventDetailLocation}>
              <MapPinIcon /> {event.location}
            </div>
          )}

          {event.reveal_pending && (
            <div className={styles.revealHint}>Sted og lenke vises nærmere arrangementet.</div>
          )}

          {event.description && (
            <p className={styles.modalText}>{event.description}</p>
          )}

          {event.link && !event.reveal_pending && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className={styles.bookLink}>
              Gå til arrangement →
            </a>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.okBtn} onClick={onClose}>Lukk</button>
        </div>

      </div>
    </div>
  )
}

// ─── ArchiveModal ─────────────────────────────────────────────────────────────

function ArchiveModal({ onClose }) {
  const [events, setEvents]     = useState([])
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') {
        if (selected) setSelected(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, selected])

  async function fetchPage(p) {
    setLoading(true)
    const res  = await fetch(`/api/events?archive=1&page=${p}&per_page=10`)
    const data = await res.json()
    if (p === 1) setEvents(data.events)
    else setEvents(prev => [...prev, ...data.events])
    setHasMore(data.hasMore)
    setPage(p)
    setLoading(false)
  }

  useEffect(() => { fetchPage(1) }, [])

  return (
    <div
      className={styles.backdrop}
      onClick={e => e.target === e.currentTarget && (selected ? setSelected(null) : onClose())}
    >
      <div className={`${styles.modal} ${styles.archiveModal}`} role="dialog" aria-modal="true">

        {selected ? (
          <>
            <div className={styles.modalHeader}>
              <button className={styles.backBtn} onClick={() => setSelected(null)}>← Tilbake</button>
              <button className={styles.closeBtn} onClick={onClose} title="Lukk"><CloseIcon /></button>
            </div>
            <div className={styles.eventDetailBody}>
              <div className={styles.badgeRow}>
                <TypeBadge type={selected.type} cancelled={selected.cancelled} />
              </div>
              <h2 className={styles.modalTitle}>{selected.title}</h2>
              <div className={styles.eventDetailMeta}>
                {fmtEventDate(selected.event_date)} · {fmtEventTime(selected.event_date)}
              </div>
              {selected.location && (
                <div className={styles.eventDetailLocation}><MapPinIcon /> {selected.location}</div>
              )}
              {selected.description && <p className={styles.modalText}>{selected.description}</p>}
              {selected.link && (
                <a href={selected.link} target="_blank" rel="noopener noreferrer" className={styles.bookLink}>
                  Gå til arrangement →
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Tidligere hendelser</h2>
              <button className={styles.closeBtn} onClick={onClose} title="Lukk"><CloseIcon /></button>
            </div>

            <div className={styles.archiveList}>
              {events.length === 0 && !loading && (
                <div className={styles.archiveEmpty}>Ingen tidligere hendelser.</div>
              )}
              {events.map(ev => (
                <button key={ev.id} className={styles.archiveRow} onClick={() => setSelected(ev)}>
                  <div className={styles.archiveRowLeft}>
                    <div className={styles.archiveRowTitle}>{ev.title}</div>
                    <div className={styles.archiveRowDate}>
                      {fmtEventDate(ev.event_date)} · {fmtEventTime(ev.event_date)}
                    </div>
                  </div>
                  <TypeBadge type={ev.type} cancelled={ev.cancelled} />
                </button>
              ))}
              {loading && <div className={styles.archiveEmpty}>Laster…</div>}
            </div>

            {hasMore && (
              <button className={styles.loadMoreBtn} onClick={() => fetchPage(page + 1)} disabled={loading}>
                Vis mer
              </button>
            )}
          </>
        )}

      </div>
    </div>
  )
}

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({ event, onClick }) {
  return (
    <div className={styles.eventCard} onClick={() => onClick(event)}>
      <div className={styles.badgeRow}>
        <TypeBadge type={event.type} cancelled={event.cancelled} />
      </div>
      <div className={styles.eventCardTitle}>{event.title}</div>
      <div className={styles.eventCardDate}>
        {fmtEventDate(event.event_date)} · {fmtEventTime(event.event_date)}
      </div>
      {event.location && !event.reveal_pending && (
        <div className={styles.eventCardLocation}>{event.location}</div>
      )}
      {event.description && (
        <div className={styles.eventCardDesc}>{truncate(event.description)}</div>
      )}
    </div>
  )
}

// ─── KursCard ─────────────────────────────────────────────────────────────────

function KursCard({ icon, title, desc, onClick }) {
  return (
    <div className={styles.card} onClick={onClick} style={onClick ? undefined : { cursor: 'default' }}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardDesc}>{desc}</div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KursPage() {
  const [showBooking, setShowBooking]       = useState(false)
  const [selectedEvent, setSelectedEvent]   = useState(null)
  const [showArchive, setShowArchive]       = useState(false)
  const [events, setEvents]                 = useState([])
  const [eventsLoading, setEventsLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => { setEvents(data); setEventsLoading(false) })
      .catch(() => setEventsLoading(false))
  }, [])

  return (
    <main className={styles.main}>
      {showBooking   && <BookingModal onClose={() => setShowBooking(false)} />}
      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      {showArchive   && <ArchiveModal onClose={() => setShowArchive(false)} />}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Kurs</h1>
        <p className={styles.pageSubtitle}>Veiledning, fordypning og Uro-skolen.</p>
      </div>

      {/* Kurs — DB-backed events */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Kurs</h2>

        {eventsLoading ? (
          <div className={styles.eventsEmpty}>Laster…</div>
        ) : events.length === 0 ? (
          <div className={styles.eventsEmpty}>
            Ingen kommende kurs eller arrangementer akkurat nå. Sjekk tilbake snart.
          </div>
        ) : (
          <div className={styles.scrollRow}>
            {events.map(ev => (
              <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />
            ))}
          </div>
        )}

        <button className={styles.archiveLink} onClick={() => setShowArchive(true)}>
          Vis tidligere hendelser
        </button>
        <div className={styles.divider} />
      </div>

      {/* Urofordypning */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Urofordypning</h2>
        <div className={styles.scrollRow}>
          <KursCard
            icon={<UserIcon />}
            title="Én-til-én veiledning"
            desc="Personlig veiledning online eller fysisk."
            onClick={() => setShowBooking(true)}
          />
          <KursCard
            icon={<CalendarDaysIcon />}
            title="Fordypningsretreat"
            desc="Fordyp praksisen gjennom retreats og workshops."
          />
        </div>
        <div className={styles.divider} />
      </div>

      {/* Uro-skolen */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Uro-skolen</h2>
        <div className={styles.scrollRow}>
          <KursCard icon={<InfoIcon />}   title="Kommer snart" desc="Innhold er under utarbeidelse." />
          <KursCard icon={<LayersIcon />} title="Kommer snart" desc="Innhold er under utarbeidelse." />
        </div>
      </div>

    </main>
  )
}
