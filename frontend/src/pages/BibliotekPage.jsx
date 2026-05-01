import { useState, useEffect } from 'react'
import styles from './BibliotekPage.module.css'
import ContentCard from '../components/ContentCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import AudioModal from '../components/AudioModal'
import AudioPlayer from '../components/AudioPlayer'
import { SECTION_META, FILTER_OPTIONS } from '../data/library'

function groupByType(items) {
  const order = ['audio', 'case', 'reflect', 'video']
  const map = {}
  items.forEach(item => {
    if (!map[item.type]) map[item.type] = []
    map[item.type].push(item)
  })
  return order
    .filter(t => map[t]?.length)
    .map(t => ({ type: t, ...SECTION_META[t], items: map[t] }))
}

export default function BibliotekPage({
  initialFilter = 'all',
  progress = {}, reflections = {},
  updateProgress, updateReflection,
}) {
  const [filter, setFilter]                     = useState(initialFilter)
  const [sections, setSections]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase]             = useState(null)
  const [activeAudio, setActiveAudio]           = useState(null)
  const [playingAudio, setPlayingAudio]         = useState(null)

  useEffect(() => { setFilter(initialFilter ?? 'all') }, [initialFilter])

  useEffect(() => {
    setLoading(true)
    const url = filter === 'all' ? '/api/content' : `/api/content?type=${filter}`
    fetch(url, { cache: 'no-store' })
      .then(r => r.json())
      .then(items => {
        setSections(filter === 'all' ? groupByType(items) : [{ type: filter, ...SECTION_META[filter], items }])
      })
      .finally(() => setLoading(false))
  }, [filter])

  function handlePlay(item) {
    setActiveAudio(null)
    setPlayingAudio(item)
  }

  return (
    <main className={styles.main}>

      <ReflectionModal
        item={activeReflection}
        savedText={activeReflection ? (reflections[activeReflection.id] ?? '') : ''}
        onClose={() => setActiveReflection(null)}
        onSave={(text) => updateReflection?.(activeReflection.id, text)}
      />
      <CaseModal
        item={activeCase}
        onClose={() => setActiveCase(null)}
        completed={activeCase ? !!progress[activeCase.id]?.completed_at : false}
        onComplete={() => updateProgress?.(activeCase.id, { completed: true })}
      />
      <AudioModal
        item={activeAudio}
        onClose={() => setActiveAudio(null)}
        onPlay={handlePlay}
      />
      {playingAudio && (
        <AudioPlayer
          src={`/api/audio/${playingAudio.r2_key}`}
          title={playingAudio.title}
          info={playingAudio.abstract}
          type="Lyd"
          autoFullscreen
          itemId={playingAudio.id}
          initialPosition={progress[playingAudio.id]?.position_seconds ?? 0}
          initialListenSeconds={progress[playingAudio.id]?.listen_seconds ?? 0}
          onSaveProgress={(pos, listenSecs, completed) =>
            updateProgress?.(playingAudio.id, {
              position_seconds: pos,
              listen_seconds:   listenSecs,
              ...(completed ? { completed } : {}),
            })
          }
          onFullscreenClose={() => setPlayingAudio(null)}
        />
      )}

      <div className={styles.header}>
        <h1 className={styles.title}>Bibliotek</h1>
        <p className={styles.subtitle}>Alt innhold – tilgjengelig for deg når du vil</p>
      </div>

      <div className={styles.filterBar}>
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`${styles.filterBtn} ${filter === opt.value ? styles.active : ''}`}
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Laster innhold…</div>
      ) : (
        <div className={styles.sections}>
          {sections.map(section => (
            <div key={section.type} className={styles.section}>
              {filter === 'all' && (
                <div className={styles.sectionLabel}>{section.label}</div>
              )}
              <div className={styles.grid}>
                {section.items.map(item => {
                  const itemProgress = progress[item.id]
                  return (
                    <ContentCard
                      key={item.id}
                      type={section.type}
                      label={section.tag}
                      title={item.title}
                      abstract={item.abstract}
                      meta={item.meta}
                      weeks={item.weeks}
                      completed={!!itemProgress?.completed_at}
                      listenSeconds={itemProgress?.listen_seconds ?? 0}
                      positionSeconds={itemProgress?.position_seconds ?? 0}
                      onClick={
                        section.type === 'reflect' ? () => setActiveReflection(item)
                        : section.type === 'case'  ? () => setActiveCase(item)
                        : section.type === 'audio' ? () => setActiveAudio(item)
                        : undefined
                      }
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  )
}
