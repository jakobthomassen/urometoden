import { useState } from 'react'
import styles from './HomePage.module.css'
import AudioPlayer from '../components/AudioPlayer'
import ContentCard from '../components/ContentCard'
import AboutCard from '../components/AboutCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { WEEK_1 } from '../data/weeks'

export default function HomePage() {
  const week = WEEK_1
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase] = useState(null)

  return (
    <main className={styles.main}>

      <ReflectionModal
        item={activeReflection}
        onClose={() => setActiveReflection(null)}
      />
      <CaseModal
        item={activeCase}
        onClose={() => setActiveCase(null)}
      />

      <div className={styles.header}>
        <div className={styles.weekLabel}>{week.weekLabel}</div>
        <h1 className={styles.title}>{week.title}</h1>
        <p className={styles.subtitle}>{week.subtitle}</p>
      </div>

      <AudioPlayer
        src={week.audio.src}
        type={week.audio.type}
        title={week.audio.title}
        info={week.audio.info}
      />

      <div>
        <div className={styles.sectionLabel}>Denne ukens innhold</div>
        <div className={styles.contentGrid}>
          {week.content.map(item => (
            <ContentCard
              key={item.id}
              {...item}
              onClick={
                item.type === 'reflect' ? () => setActiveReflection(item)
                : item.type === 'case'  ? () => setActiveCase(item)
                : undefined
              }
            />
          ))}
        </div>
      </div>

      <AboutCard heading={week.aboutStrong} body={week.about} />

    </main>
  )
}
