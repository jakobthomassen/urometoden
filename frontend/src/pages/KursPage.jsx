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

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
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

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id:      'fordypning',
    heading: 'Urofordypning',
    cards: [
      { icon: <UserIcon />,         title: 'Én-til-én veiledning', desc: 'Personlig veiledning online eller fysisk.', booking: true },
      { icon: <CalendarDaysIcon />, title: 'Kurs',                 desc: 'Fordyp praksisen gjennom kurs og retreats.' },
    ],
  },
  {
    id:      'kurs',
    heading: 'Kurs',
    cards: [
      { icon: <ClockIcon />,  title: 'Kommende kurs', desc: 'Se datoer og påmelding.' },
      { icon: <MapPinIcon />, title: 'Fysiske kurs',  desc: 'Møt opp og praktiser sammen.' },
    ],
  },
  {
    id:      'uro-skolen',
    heading: 'Uro-skolen',
    cards: [
      { icon: <InfoIcon />,   title: 'Kommer snart', desc: 'Innhold er under utarbeidelse.' },
      { icon: <LayersIcon />, title: 'Kommer snart', desc: 'Innhold er under utarbeidelse.' },
    ],
  },
]

// ─── Booking modal ───────────────────────────────────────────────────────────

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
          <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className={styles.modalText}>
          Book en personlig veiledningstime med en av våre veiledere — online eller fysisk.
          Du finner ledige tider og påmelding på urometoden.no.
        </p>

        <div className={styles.modalFooter}>
          <a
            href="https://www.urometoden.no/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bookLink}
          >
            Gå til timebestilling →
          </a>
          <button className={styles.okBtn} onClick={onClose}>OK</button>
        </div>

      </div>
    </div>
  )
}

// ─── Components ──────────────────────────────────────────────────────────────

function KursCard({ icon, title, desc, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.iconWrap}>{icon}</div>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardDesc}>{desc}</div>
    </div>
  )
}

function KursSection({ heading, cards, last, onBooking }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionHeading}>{heading}</h2>
      <div className={styles.scrollRow}>
        {cards.map((card, i) => (
          <KursCard
            key={i}
            icon={card.icon}
            title={card.title}
            desc={card.desc}
            onClick={card.booking ? onBooking : undefined}
          />
        ))}
      </div>
      {!last && <div className={styles.divider} />}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function KursPage() {
  const [showBooking, setShowBooking] = useState(false)

  return (
    <main className={styles.main}>
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Kurs</h1>
        <p className={styles.pageSubtitle}>Veiledning, fordypning og Uro-skolen.</p>
      </div>

      {SECTIONS.map((section, i) => (
        <KursSection
          key={section.id}
          heading={section.heading}
          cards={section.cards}
          last={i === SECTIONS.length - 1}
          onBooking={() => setShowBooking(true)}
        />
      ))}
    </main>
  )
}
