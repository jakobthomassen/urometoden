import { useState, useEffect } from 'react'
import styles from './KursPage.module.css'
import { CardIcon } from '../components/CardIcons'

// ─── Icons ───────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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

// ─── TypeBadge ────────────────────────────────────────────────────────────────

function TypeBadge({ type, cancelled }) {
  if (cancelled === 1) return <span className={`${styles.typeBadge} ${styles.typeBadgeCancelled}`}>Avlyst</span>
  const isOnline = type === 'online'
  return (
    <span className={`${styles.typeBadge} ${isOnline ? styles.typeBadgeOnline : styles.typeBadgeFysisk}`}>
      {isOnline ? 'Online' : 'Fysisk'}
    </span>
  )
}

// ─── CardModal ────────────────────────────────────────────────────────────────

function CardModal({ card, onClose }) {
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
            <div className={styles.iconWrap}><CardIcon name={card.icon} /></div>
            <h2 className={styles.modalTitle}>{card.title}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)"><CloseIcon /></button>
        </div>

        {card.description && <p className={styles.modalText}>{card.description}</p>}

        {card.link && (
          <a href={card.link} target="_blank" rel="noopener noreferrer" className={styles.bookLink}>
            {card.link_label || 'Les mer'} →
          </a>
        )}

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

function KursCard({ card, onClick }) {
  return (
    <div className={styles.card} onClick={() => onClick(card)}>
      <div className={styles.iconWrap}><CardIcon name={card.icon} /></div>
      <div className={styles.cardTitle}>{card.title}</div>
      {card.description && <div className={styles.cardDesc}>{card.description}</div>}
      {card.link_label && <div className={styles.cardLinkHint}>{card.link_label} →</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KursPage() {
  const [selectedCard, setSelectedCard]     = useState(null)
  const [selectedEvent, setSelectedEvent]   = useState(null)
  const [showArchive, setShowArchive]       = useState(false)
  const [events, setEvents]                 = useState([])
  const [eventsLoading, setEventsLoading]   = useState(true)
  const [sectionCards, setSectionCards]     = useState({ fordypning: [], uroskolen: [] })

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => { setEvents(data); setEventsLoading(false) })
      .catch(() => setEventsLoading(false))
  }, [])

  useEffect(() => {
    fetch('/api/section-cards')
      .then(r => r.json())
      .then(data => {
        const grouped = { fordypning: [], uroskolen: [] }
        for (const card of data) {
          if (grouped[card.section]) grouped[card.section].push(card)
        }
        setSectionCards(grouped)
      })
      .catch(() => {})
  }, [])

  return (
    <main className={styles.main}>
      {selectedCard  && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
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
      {sectionCards.fordypning.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>Urofordypning</h2>
          <div className={styles.scrollRow}>
            {sectionCards.fordypning.map(card => (
              <KursCard key={card.id} card={card} onClick={setSelectedCard} />
            ))}
          </div>
          <div className={styles.divider} />
        </div>
      )}

      {/* Uro-skolen */}
      {sectionCards.uroskolen.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>Uro-skolen</h2>
          <div className={styles.scrollRow}>
            {sectionCards.uroskolen.map(card => (
              <KursCard key={card.id} card={card} onClick={setSelectedCard} />
            ))}
          </div>
        </div>
      )}

    </main>
  )
}
