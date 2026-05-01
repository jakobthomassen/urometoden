import { useState, useEffect } from 'react'
import styles from './HomePage.module.css'
import AudioPlayer from '../components/AudioPlayer'
import ContentCard from '../components/ContentCard'
import AboutCard from '../components/AboutCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { WEEK_1, WEEKS } from '../data/weeks'
import { SECTION_META } from '../data/library'

export default function HomePage({
  weekId = 1,
  progress = {}, reflections = {},
  startWeek, updateProgress, updateReflection, devUnlockWeek,
  onProgressChange, isAdmin,
}) {
  const weekMeta  = WEEKS.find(w => w.id === weekId) ?? WEEKS[0]
  const week1Data = weekId === 1 ? WEEK_1 : null

  const [content, setContent]                   = useState([])
  const [loading, setLoading]                   = useState(true)
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase]             = useState(null)

  useEffect(() => {
    startWeek?.(weekId)
  }, [weekId])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/weeks/${weekId}/content`, { cache: 'no-store' })
      .then(r => r.json())
      .then(items => setContent(items))
      .finally(() => setLoading(false))
  }, [weekId])

  async function markComplete(itemId) {
    await updateProgress?.(itemId, { completed: true })
    onProgressChange?.()
  }

  async function handleReflectionSave(itemId, text) {
    await updateReflection?.(itemId, text)
    onProgressChange?.()
  }

  async function handleDevUnlock() {
    await devUnlockWeek?.(weekId)
    onProgressChange?.()
  }

  const completedIds = content.map(i => i.id).filter(id => !!progress[id]?.completed_at)
  const allComplete  = content.length > 0 && content.every(i => !!progress[i.id]?.completed_at)
  const hasNextWeek  = weekId < 8

  return (
    <main className={styles.main}>

      <ReflectionModal
        item={activeReflection}
        savedText={activeReflection ? (reflections[activeReflection.id] ?? '') : ''}
        onClose={() => setActiveReflection(null)}
        onSave={(text) => handleReflectionSave(activeReflection.id, text)}
      />
      <CaseModal
        item={activeCase}
        onClose={() => setActiveCase(null)}
        onComplete={() => markComplete(activeCase.id)}
        completed={activeCase ? !!progress[activeCase.id]?.completed_at : false}
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
            {content.map(item => {
              const itemProgress = progress[item.id]
              return (
                <ContentCard
                  key={item.id}
                  type={item.type}
                  label={SECTION_META[item.type]?.tag ?? item.type}
                  title={item.title}
                  meta={item.meta}
                  completed={!!itemProgress?.completed_at}
                  listenSeconds={itemProgress?.listen_seconds ?? 0}
                  positionSeconds={itemProgress?.position_seconds ?? 0}
                  onClick={() => {
                    if (item.type === 'reflect') {
                      setActiveReflection(item)
                    } else if (item.type === 'case') {
                      setActiveCase(item)
                    } else {
                      markComplete(item.id)
                    }
                  }}
                />
              )
            })}
          </div>
        )}
      </div>

      {week1Data && (
        <AboutCard heading={week1Data.aboutStrong} body={week1Data.about} />
      )}

      {allComplete && hasNextWeek && isAdmin && (
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
