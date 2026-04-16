import { useState, useEffect } from 'react'
import styles from './HomePage.module.css'
import AudioPlayer from '../components/AudioPlayer'
import ContentCard from '../components/ContentCard'
import AboutCard from '../components/AboutCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { WEEK_1, WEEKS } from '../data/weeks'
import { SECTION_META } from '../data/library'

export default function HomePage({ weekId = 1 }) {
  const weekMeta   = WEEKS.find(w => w.id === weekId) ?? WEEKS[0]
  const week1Data  = weekId === 1 ? WEEK_1 : null   // static detail only exists for week 1 for now

  const [content, setContent]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase]       = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/weeks/${weekId}/content`)
      .then(r => r.json())
      .then(items => setContent(items))
      .finally(() => setLoading(false))
  }, [weekId])

  return (
    <main className={styles.main}>

      <ReflectionModal item={activeReflection} onClose={() => setActiveReflection(null)} />
      <CaseModal       item={activeCase}        onClose={() => setActiveCase(null)} />

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
                onClick={
                  item.type === 'reflect' ? () => setActiveReflection(item)
                  : item.type === 'case'  ? () => setActiveCase(item)
                  : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      {week1Data && (
        <AboutCard heading={week1Data.aboutStrong} body={week1Data.about} />
      )}

    </main>
  )
}
