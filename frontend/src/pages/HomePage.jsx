import { useState, useEffect } from 'react'
import styles from './HomePage.module.css'
import AudioPlayer from '../components/AudioPlayer'
import ContentCard from '../components/ContentCard'
import AboutCard from '../components/AboutCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { WEEK_1, WEEKS } from '../data/weeks'
import { SECTION_META } from '../data/library'
import { startWeek, completeItem, getCompletedItems, devUnlockNext } from '../utils/progress'

export default function HomePage({ weekId = 1, onProgressChange }) {
  const weekMeta  = WEEKS.find(w => w.id === weekId) ?? WEEKS[0]
  const week1Data = weekId === 1 ? WEEK_1 : null

  const [content, setContent]                   = useState([])
  const [loading, setLoading]                   = useState(true)
  const [completedItems, setCompletedItems]     = useState(() => getCompletedItems(weekId))
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase]             = useState(null)

  // Record that the user opened this week
  useEffect(() => { startWeek(weekId) }, [weekId])

  useEffect(() => {
    setLoading(true)
    setCompletedItems(getCompletedItems(weekId))
    fetch(`/api/weeks/${weekId}/content`, { cache: 'no-store' })
      .then(r => r.json())
      .then(items => setContent(items))
      .finally(() => setLoading(false))
  }, [weekId])

  function markComplete(itemId) {
    const allIds = content.map(i => i.id)
    const { allDone } = completeItem(weekId, itemId, allIds)
    setCompletedItems(getCompletedItems(weekId))
    if (allDone) onProgressChange?.()
  }

  function handleDevUnlock() {
    devUnlockNext(weekId)
    onProgressChange?.()
  }

  const allComplete = content.length > 0 && content.every(i => completedItems.includes(i.id))
  const hasNextWeek = weekId < 8

  return (
    <main className={styles.main}>

      <ReflectionModal
        item={activeReflection}
        onClose={() => setActiveReflection(null)}
      />
      <CaseModal
        item={activeCase}
        onClose={() => setActiveCase(null)}
        onComplete={() => markComplete(activeCase.id)}
        completed={activeCase ? completedItems.includes(activeCase.id) : false}
      />

      <div className={styles.header}>
        <div className={styles.weekLabel}>Uke {weekMeta.id} av 8</div>
        <h1 className={styles.title}>{weekMeta.title}</h1>
        <p className={styles.subtitle}>{weekMeta.description}</p>
      </div>

      {week1Data && (
        <AudioPlayer
          src={week1Data.audio.src}
          type={week1Data.audio.type}
          title={week1Data.audio.title}
          info={week1Data.audio.info}
        />
      )}

      <div>
        <div className={styles.sectionLabel}>Denne ukens innhold</div>
        {loading ? (
          <div className={styles.loading}>Laster innhold…</div>
        ) : (
          <div className={styles.contentGrid}>
            {content.map(item => (
              <ContentCard
                key={item.id}
                type={item.type}
                label={SECTION_META[item.type]?.tag ?? item.type}
                title={item.title}
                meta={item.meta}
                completed={completedItems.includes(item.id)}
                onClick={() => {
                  if (item.type === 'reflect') { markComplete(item.id); setActiveReflection(item) }
                  else if (item.type === 'case') setActiveCase(item)
                  else markComplete(item.id)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {week1Data && (
        <AboutCard heading={week1Data.aboutStrong} body={week1Data.about} />
      )}

      {allComplete && hasNextWeek && (
        <div className={styles.devUnlock}>
          <span className={styles.devLabel}>DEV</span>
          <span className={styles.devText}>Alle moduler fullført.</span>
          <button className={styles.devBtn} onClick={handleDevUnlock}>
            Lås opp uke {weekId + 1} nå
          </button>
        </div>
      )}

    </main>
  )
}
