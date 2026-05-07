import { useState, useEffect, useCallback } from 'react'
import styles from './AdminPage.module.css'

// ─── Event catalogue ──────────────────────────────────────────────────────────

const EVENT_LABELS = {
  'user.signup':             'Ny bruker registrert',
  'user.trial_granted':      '7-dagers prøveperiode gitt',
  'user.member_granted':     '1 måneds tilgang gitt',
  'user.access_revoked':     'Tilgang fjernet',
  'user.membership_expired': 'Medlemskap utløpt automatisk',
  'user.admin_promoted':     'Promotert til administrator',
  'user.admin_revoked':      'Administrator-status fjernet',
  'user.account_deleted':    'Konto slettet av bruker',
  'event.created':           'Arrangement opprettet',
  'event.updated':           'Arrangement oppdatert',
  'event.cancelled':         'Arrangement avlyst',
  'event.restored':          'Arrangement gjenopprettet',
  'event.deleted':           'Arrangement slettet',
  'section_card.created':    'Seksjonskort opprettet',
  'section_card.updated':    'Seksjonskort oppdatert',
  'section_card.deleted':    'Seksjonskort slettet',
  // TODO: add when event signup system is implemented
  // 'user.event_signup':    'Påmeldt arrangement',
  // 'user.event_checkin':   'Sjekket inn til arrangement',
  // 'event.ended':          'Arrangement avsluttet',     (requires scheduled job)
  // TODO: add when week/progress events are instrumented
  // 'user.week_completed':  'Uke fullført',
}

const TAGS = [
  { id: 'all',         label: 'Alle'          },
  { id: 'bruker',      label: 'Bruker'        },
  { id: 'tilgang',     label: 'Tilgang'       },
  { id: 'admin',       label: 'Admin'         },
  { id: 'arrangement', label: 'Arrangement'   },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(tsMs) {
  const diff = Date.now() - tsMs
  const min  = Math.floor(diff / 60_000)
  const hr   = Math.floor(diff / 3_600_000)
  const day  = Math.floor(diff / 86_400_000)
  if (min < 1)  return 'Nå nettopp'
  if (min < 60) return `${min} min siden`
  if (hr  < 24) return `${hr}t siden`
  if (day < 7)  return `${day} dag${day !== 1 ? 'er' : ''} siden`
  return new Date(tsMs).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function parseLogMeta(log) {
  try { return log.meta ? JSON.parse(log.meta) : {} }
  catch { return {} }
}

function describeTarget(log) {
  const meta = parseLogMeta(log)
  // For deleted accounts the user rows are gone — fall back to meta
  const name  = log.target_name  ?? meta.name  ?? null
  const email = log.target_email ?? meta.email ?? null
  if (!name && !email) return null
  if (name && email) return `${name} (${email})`
  return name ?? email
}

function describeActor(log) {
  if (!log.actor_id) return 'System'
  if (log.actor_id === log.target_id) return null  // same person (e.g. account deletion)
  return log.actor_name ?? `Bruker #${log.actor_id}`
}

function describeExtra(log) {
  const meta = parseLogMeta(log)
  if ((log.event.startsWith('event.') || log.event.startsWith('section_card.')) && meta.title) return `«${meta.title}»`
  return null
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function LogRow({ log }) {
  const label  = EVENT_LABELS[log.event] ?? log.event
  const target = describeTarget(log)
  const actor  = describeActor(log)
  const extra  = describeExtra(log)

  return (
    <div className={styles.logRow}>
      <span className={`${styles.logTag} ${styles[`logTag_${log.tag}`]}`}>{log.tag}</span>
      <div className={styles.logBody}>
        <div className={styles.logLabel}>
          {label}
          {extra && <span className={styles.logExtra}> · {extra}</span>}
        </div>
        <div className={styles.logMeta}>
          {target && <span>{target}</span>}
          {actor  && <span className={styles.logActor}>via {actor}</span>}
        </div>
      </div>
      <div className={styles.logTime}>{timeAgo(log.created_at)}</div>
    </div>
  )
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

export default function AdminLoggTab() {
  const [activeTag, setActiveTag] = useState('all')
  const [logs, setLogs]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [hasMore, setHasMore]     = useState(false)
  const [loading, setLoading]     = useState(false)

  const fetchLogs = useCallback(async (tag, p, append = false) => {
    setLoading(true)
    const params = new URLSearchParams({ tag, page: p, per_page: 50 })
    const res    = await fetch(`/api/admin/logs?${params}`)
    const data   = await res.json()
    setLogs(prev => append ? [...prev, ...data.results] : data.results)
    setTotal(data.total)
    setHasMore(data.hasMore)
    setPage(p)
    setLoading(false)
  }, [])

  // Reload from page 1 whenever the tag filter changes
  useEffect(() => {
    setLogs([])
    fetchLogs(activeTag, 1, false)
  }, [activeTag, fetchLogs])

  function handleTagChange(tag) {
    if (tag === activeTag) return
    setActiveTag(tag)
  }

  function loadMore() {
    fetchLogs(activeTag, page + 1, true)
  }

  return (
    <div className={styles.loggTab}>

      <div className={styles.loggHeader}>
        <div className={styles.loggFilterRow}>
          {TAGS.map(t => (
            <button
              key={t.id}
              className={`${styles.loggFilterBtn} ${activeTag === t.id ? styles.loggFilterBtnActive : ''}`}
              onClick={() => handleTagChange(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {total > 0 && (
          <div className={styles.loggCount}>{total} oppføringer</div>
        )}
      </div>

      {loading && logs.length === 0 ? (
        <div className={styles.empty}>Laster…</div>
      ) : logs.length === 0 ? (
        <div className={styles.empty}>Ingen loggoppføringer ennå.</div>
      ) : (
        <div className={styles.logList}>
          {logs.map(log => <LogRow key={log.id} log={log} />)}
        </div>
      )}

      {hasMore && (
        <button className={styles.loggLoadMore} onClick={loadMore} disabled={loading}>
          {loading ? 'Laster…' : 'Vis mer'}
        </button>
      )}

    </div>
  )
}
