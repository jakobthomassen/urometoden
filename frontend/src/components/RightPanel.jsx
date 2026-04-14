import styles from './RightPanel.module.css'
import StatCard from './StatCard'
import TestimonyCard from './TestimonyCard'
import CourseCard from './CourseCard'

const STATS = [
  { value: '0',   label: 'Lydfiler lyttet' },
  { value: '0t',  label: 'Total lyttetid' },
  { value: '1',   label: 'Dager i strekk' },
  { value: '0/8', label: 'Uker fullført' },
]

const TESTIMONIALS = [
  {
    quote: 'For første gang forstår jeg hva uroen faktisk vil meg – det endret alt.',
    author: 'Kurs-deltaker, Oslo',
  },
  {
    quote: 'Lydfilene er utrolig beroligende. Jeg gleder meg til hver uke.',
    author: 'Deltaker, Bergen',
  },
]

const COURSES = [
  { emoji: '🎓', name: 'Uroskolen – Grunnkurs',  meta: '8 moduler · Tilgjengelig nå',        thumbColor: 'green' },
  { emoji: '📖', name: 'Fordypningskurs',          meta: 'Tilgjengelig etter uke 4',            thumbColor: 'amber' },
  { emoji: '✦',  name: 'Uroskolen live',           meta: 'Neste sesjon: 28. april',             thumbColor: 'green' },
]

export default function RightPanel() {
  return (
    <aside className={styles.panel}>

      <section>
        <div className={styles.sectionTitle}>Din fremgang</div>
        <div className={styles.statGrid}>
          {STATS.map(s => <StatCard key={s.label} value={s.value} label={s.label} />)}
        </div>
      </section>

      <section>
        <div className={styles.sectionTitle}>Neste uke</div>
        <div className={styles.upcomingCard}>
          <div className={styles.upcomingBadge}>2</div>
          <div>
            <div className={styles.upcomingLabel}>Låses opp etter denne uken</div>
            <div className={styles.upcomingTitle}>Reaktivitet</div>
          </div>
        </div>
      </section>

      <section>
        <div className={styles.sectionTitle}>Deltakere forteller</div>
        {TESTIMONIALS.map(t => (
          <TestimonyCard key={t.author} quote={t.quote} author={t.author} />
        ))}
      </section>

      <section>
        <div className={styles.sectionTitle}>Kurs</div>
        {COURSES.map(c => (
          <CourseCard key={c.name} {...c} />
        ))}
      </section>

    </aside>
  )
}
