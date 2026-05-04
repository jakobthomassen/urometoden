import { useState, useEffect, useRef } from 'react'
import styles from './HomePage.module.css'
import AudioPlayer from '../components/AudioPlayer'
import ContentCard from '../components/ContentCard'
import AboutCard from '../components/AboutCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import ConsentModal from '../components/ConsentModal'
import ConfirmCompleteModal from '../components/ConfirmCompleteModal'
import CongratsModal from '../components/CongratsModal'
import { WEEK_1, WEEKS } from '../data/weeks'
import { SECTION_META } from '../data/library'

function formatUnlockDays(days) {
  if (days == null || days <= 0) return 'snart'
  if (days === 1) return 'i morgen'
  return `om ${days} dager`
}

export default function HomePage({
  weekId = 1,
  weeks = [],
  progress = {}, reflections = {},
  startWeek, updateProgress, updateReflection, devUnlockWeek,
  onProgressChange, onNavigateToWeek, isAdmin,
  reflectionConsent = false, grantReflectionConsent,
}) {
  const weekMeta  = WEEKS.find(w => w.id === weekId) ?? WEEKS[0]
  const week1Data = weekId === 1 ? WEEK_1 : null

  const [content, setContent]                   = useState([])
  const [loading, setLoading]                   = useState(true)
  const [activeReflection, setActiveReflection]   = useState(null)
  const [activeCase, setActiveCase]               = useState(null)
  const [pendingReflection, setPendingReflection] = useState(null)
  const [confirmItem, setConfirmItem]             = useState(null)
  const [playingItem, setPlayingItem]           = useState(null)
  const [glowKey, setGlowKey]                   = useState(0)
  const [showCongrats, setShowCongrats]         = useState(false)
  const prevComplete                            = useRef(null)

  useEffect(() => {
    startWeek?.(weekId)
    setPlayingItem(null)
    setShowCongrats(false)
    prevComplete.current = null
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

  const allComplete  = content.length > 0 && content.every(i => !!progress[i.id]?.completed_at)
  const hasNextWeek  = weekId < 8
  const nextWeek     = hasNextWeek ? weeks.find(w => w.id === weekId + 1) ?? null : null
  const nextLocked   = nextWeek?.status === 'locked'

  useEffect(() => {
    if (loading) return
    if (prevComplete.current === false && allComplete && hasNextWeek) {
      setShowCongrats(true)
    }
    prevComplete.current = allComplete
  }, [allComplete, loading])

  return (
    <main className={styles.main}>

      <CongratsModal
        open={showCongrats}
        weekId={weekId}
        nextWeek={nextWeek}
        onClose={() => setShowCongrats(false)}
        onNavigate={onNavigateToWeek}
      />
      <ConfirmCompleteModal
        item={confirmItem}
        onConfirm={() => markComplete(confirmItem.id)}
        onClose={() => setConfirmItem(null)}
      />
      <ConsentModal
        open={pendingReflection !== null}
        onClose={() => setPendingReflection(null)}
        onConsent={async () => {
          await grantReflectionConsent?.()
          setActiveReflection(pendingReflection)
          setPendingReflection(null)
        }}
      />
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
        <div className={styles.weekLabelRow}>
          <span className={styles.weekLabel}>Uke {weekMeta.id} av 8</span>
          {allComplete && <span className={styles.completedChip}>✓ Fullført</span>}
        </div>
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
                  onMarkComplete={() => setConfirmItem(item)}
                  onClick={() => {
                    if (item.type === 'reflect') {
                      if (reflectionConsent) setActiveReflection(item)
                      else setPendingReflection(item)
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

      {allComplete && (
        <div className={`${styles.nextCard} ${!hasNextWeek ? styles.nextCardFinal : nextLocked ? styles.nextCardLocked : styles.nextCardReady}`}>

          <div className={styles.completionRow}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 7 5.5 10.5 12 3.5" />
            </svg>
            Uke {weekId} fullført
          </div>

          <div className={styles.nextDivider} />

          {!hasNextWeek ? (
            <div className={styles.finalMsg}>
              <div className={styles.nextTitle}>Du har fullført Urometoden</div>
              <div className={styles.nextSub}>Gratulerer med gjennomføringen av alle 8 ukene.</div>
            </div>
          ) : nextLocked ? (
            <div className={styles.lockedBody}>
              <div className={styles.lockRow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className={styles.nextTitle}>Uke {nextWeek.id} – {nextWeek.title}</span>
              </div>
              <div className={styles.nextSub}>
                Neste uke låses opp {formatUnlockDays(nextWeek.daysUntilUnlock)}.
              </div>
              {isAdmin && (
                <div className={styles.devRow}>
                  <span className={styles.devLabel}>DEV</span>
                  <button className={styles.devBtn} onClick={handleDevUnlock}>
                    Lås opp uke {nextWeek.id} nå
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.readyBody}>
              <div className={styles.nextTitle}>Uke {nextWeek.id} – {nextWeek.title}</div>
              {nextWeek.description && <div className={styles.nextSub}>{nextWeek.description}</div>}
              <button className={styles.nextBtn} onClick={() => onNavigateToWeek?.(nextWeek.id)}>
                Gå til uke {nextWeek.id} →
              </button>
            </div>
          )}

        </div>
      )}

    </main>
  )
}
