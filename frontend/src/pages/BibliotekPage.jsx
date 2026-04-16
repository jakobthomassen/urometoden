import { useState, useEffect } from 'react'
import styles from './BibliotekPage.module.css'
import ContentCard from '../components/ContentCard'
import ReflectionModal from '../components/ReflectionModal'
import CaseModal from '../components/CaseModal'
import { SECTION_META, FILTER_OPTIONS } from '../data/library'

// Group a flat array of content_items by type into the sections shape the UI expects
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

export default function BibliotekPage({ initialFilter = 'all' }) {
  const [filter, setFilter]               = useState(initialFilter)
  const [sections, setSections]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeReflection, setActiveReflection] = useState(null)
  const [activeCase, setActiveCase]       = useState(null)

  // Sync filter from parent (sidebar navigation) without a separate fetch effect
  useEffect(() => { setFilter(initialFilter ?? 'all') }, [initialFilter])

  useEffect(() => {
    setLoading(true)
    const url = filter === 'all' ? '/api/content' : `/api/content?type=${filter}`
    fetch(url)
      .then(r => r.json())
      .then(items => {
        setSections(filter === 'all' ? groupByType(items) : [{ type: filter, ...SECTION_META[filter], items }])
      })
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <main className={styles.main}>

      <ReflectionModal item={activeReflection} onClose={() => setActiveReflection(null)} />
      <CaseModal       item={activeCase}        onClose={() => setActiveCase(null)} />

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
      )}

    </main>
  )
}
