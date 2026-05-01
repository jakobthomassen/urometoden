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
  const [playingItem, setPlayingItem]           = useState(null)
  const [glowKey, setGlowKey]                   = useState(0)

  useEffect(() => {
    startWeek?.(weekId)
    setPlayingItem(null)
  }, [weekId])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/weeks/${weekId}/content`, { cache: 'no-store' })
      .then(r => r.json())
      .then(items => {
        setContent(items)
        const def = items.find(i => i.is_default && (i.type === 'audio' || i.type === 'video'))
        if (def) {
          setPlayingItem(def)
          setGlowKey(k => k + 1)
        }
      })
      .finally(() => setLoading(false))
  }, [weekId])

  function handleAudioClick(item) {
    setPlayingItem(item)
    setGlowKey(k => k + 1)
  }

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

  const allComplete = content.length > 0 && content.every(i => !!progress[i.id]?.completed_at)
  const hasNextWeek = weekId < 8

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

      {playingItem && (
        <AudioPlayer
          src={`/api/audio/${playingItem.r2_key}`}
          type="Lyd"
          title={playingItem.title}
          info={playingItem.abstract}
          itemId={playingItem.id}
          initialPosition={progress[playingItem.id]?.position_seconds ?? 0}
          initialListenSeconds={progress[playingItem.id]?.listen_seconds ?? 0}
          onSaveProgress={(pos, listenSecs, completed) =>
            updateProgress?.(playingItem.id, {
              position_seconds: pos,
              listen_seconds:   listenSecs,
              ...(completed ? { completed } : {}),
            })
          }
          glowKey={glowKey}
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
              const isAudioOrVideo = item.type === 'audio' || item.type === 'video'
              const isCurrentlyPlaying = playingItem?.id === item.id
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
                  isPlaying={isCurrentlyPlaying}
                  onClick={() => {
                    if (item.type === 'reflect') {
                      setActiveReflection(item)
                    } else if (item.type === 'case') {
                      setActiveCase(item)
                    } else if (isAudioOrVideo) {
                      handleAudioClick(item)
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
