import { useState, useEffect } from 'react'
import styles from './BibliotekPage.module.css'
import ContentCard from '../components/ContentCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { LIBRARY_SECTIONS, FILTER_OPTIONS } from '../data/library'

export default function BibliotekPage({ initialFilter = 'all' }) {
  const [filter, setFilter] = useState(initialFilter)

  useEffect(() => { setFilter(initialFilter) }, [initialFilter])
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase] = useState(null)

  const sections = filter === 'all'
    ? LIBRARY_SECTIONS
    : LIBRARY_SECTIONS.filter(s => s.type === filter)

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

      <div className={styles.sections}>
        {sections.map(section => (
          <div key={section.type} className={styles.section}>
            {filter === 'all' && (
              <div className={styles.sectionLabel}>{section.label}</div>
            )}
            <div className={styles.grid}>
              {section.items.map(item => (
                <ContentCard
                  key={item.id}
                  type={section.type}
                  label={section.tag}
                  title={item.title}
                  meta={item.meta}
                  onClick={
                    section.type === 'reflect' ? () => setActiveReflection(item)
                    : section.type === 'case'  ? () => setActiveCase(item)
                    : undefined
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
