import styles from './DashboardPage.module.css'
import { WEEKS } from '../data/weeks'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'God morgen'
  if (h < 18) return 'God ettermiddag'
  return 'God kveld'
}

const TIPS = [
  'Uro er ikke farlig – det er et signal. Du trenger ikke bekjempe det.',
  'Tre dype pust kan skifte nervesystemet fra beredskap til ro.',
  'Legg merke til uroen uten å handle på den. Det er en ferdighet som trenes.',
  'Kroppen vet ofte hva sinnet ikke har ord for ennå.',
  'Fremgang i Urometoden handler ikke om å bli kvitt uro, men om å endre forholdet til den.',
]

function getDailyTip() {
  const day = new Date().getDate()
  return TIPS[day % TIPS.length]
}

export default function DashboardPage({ onNavigateToWeek }) {
  const activeWeek = WEEKS.find(w => w.status === 'active') ?? WEEKS[0]
  const doneCount  = WEEKS.filter(w => w.status === 'done').length
  const progress   = (doneCount / 8) * 100

  return (
    <main className={styles.main}>

      <div className={styles.greeting}>{getGreeting()}</div>

      <div className={styles.progressCard}>
        <div className={styles.progressCardTop}>
          <div>
            <div className={styles.progressLabel}>Din reise</div>
            <div className={styles.progressTitle}>
              Uke {activeWeek.id} – {activeWeek.title}
            </div>
          </div>
          <div className={styles.progressFraction}>{doneCount} / 8 uker</div>
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.progressCardBottom}>
          <span className={styles.progressSub}>
            {doneCount === 0
              ? 'Du er klar til å starte.'
              : `${8 - doneCount} uke${8 - doneCount !== 1 ? 'r' : ''} igjen.`}
          </span>
          <button
            className={styles.continueBtn}
            onClick={() => onNavigateToWeek(activeWeek.id)}
          >
            {doneCount === 0 ? 'Start reisen' : 'Fortsett reisen'} →
          </button>
        </div>
      </div>

      <div className={styles.tipCard}>
        <div className={styles.tipLabel}>Dagens tanke</div>
        <p className={styles.tipText}>{getDailyTip()}</p>
      </div>

    </main>
  )
}
