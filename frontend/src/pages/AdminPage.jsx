import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import styles from './AdminPage.module.css'
// DEV ONLY — remove before prod: bundles markdown files into the client build
import changelogRaw from '../../../CHANGELOG.md?raw'
import todoRaw      from '../../../TODO.md?raw'

// DEV ONLY — remove 'Prosjekt' tab before prod
const TABS = ['Brukere', 'Daglige tips', 'Innhold', 'Prosjekt']
const DAY  = 24 * 60 * 60 * 1000

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' })
}

function MemberBadge({ membership, expiresAt }) {
  if (membership === 'member') {
    return <span className={`${styles.badge} ${styles.badgeMember}`}>Medlem · {formatDate(expiresAt)}</span>
  }
  if (membership === 'trial') {
    return <span className={`${styles.badge} ${styles.badgeTrial}`}>Prøveperiode · {formatDate(expiresAt)}</span>
  }
  return <span className={`${styles.badge} ${styles.badgeNone}`}>Ingen tilgang</span>
}

function UserRow({ user, currentUserId, onUpdate }) {
  const [loading, setLoading] = useState(false)

  async function patch(data) {
    setLoading(true)
    const res     = await fetch(`/api/admin/users/${user.id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(data),
    })
    const updated = await res.json()
    onUpdate(updated)
    setLoading(false)
  }

  const now = Date.now()

  return (
    <div className={styles.userRow}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>{getInitials(user.name)}</div>
        <div>
          <div className={styles.userName}>{user.name || '—'}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.userBadges}>
        <MemberBadge membership={user.membership} expiresAt={user.membership_expires_at} />
        {!!user.is_admin && <span className={`${styles.badge} ${styles.badgeAdmin}`}>Admin</span>}
      </div>

      <div className={styles.userActions}>
        <button
          className={styles.btn}
          onClick={() => patch({ membership: 'trial', membership_expires_at: now + 7 * DAY })}
          disabled={loading}
        >
          7-dagers prøve
        </button>
        <button
          className={styles.btn}
          onClick={() => patch({ membership: 'member', membership_expires_at: now + 30 * DAY })}
          disabled={loading}
        >
          1 måned
        </button>
        <button
          className={`${styles.btn} ${styles.btnDanger}`}
          onClick={() => patch({ membership: 'none', membership_expires_at: null })}
          disabled={loading}
        >
          Fjern tilgang
        </button>
        {user.id !== currentUserId && (
          <button
            className={`${styles.btn} ${user.is_admin ? styles.btnDanger : styles.btnMuted}`}
            onClick={() => patch({ is_admin: user.is_admin ? 0 : 1 })}
            disabled={loading}
          >
            {user.is_admin ? 'Fjern admin' : 'Gi admin'}
          </button>
        )}
      </div>
    </div>
  )
}

function timeSinceUsed(usedAt) {
  if (!usedAt) return null
  const ms      = Date.now() - usedAt
  const minutes = Math.floor(ms / 60000)
  const hours   = Math.floor(ms / 3600000)
  const days    = Math.floor(ms / 86400000)
  if (minutes < 60)  return `${minutes}m siden`
  if (hours   < 24)  return `${hours}t siden`
  return `${days}d siden`
}

function TipsTab() {
  const [tips, setTips]       = useState([])
  const [loading, setLoading] = useState(true)
  const [newBody, setNewBody] = useState('')
  const [saving, setSaving]   = useState(false)

  async function fetchTips() {
    setLoading(true)
    const res  = await fetch('/api/admin/tips')
    const data = await res.json()
    setTips(data)
    setLoading(false)
  }

  useEffect(() => { fetchTips() }, [])

  async function handleAdd() {
    if (!newBody.trim()) return
    setSaving(true)
    await fetch('/api/admin/tips', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ body: newBody }),
    })
    setNewBody('')
    setSaving(false)
    fetchTips()
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/tips/${id}`, { method: 'DELETE' })
    setTips(prev => prev.filter(t => t.id !== id))
  }

  const unused = tips.filter(t => !t.used_at)
  const used   = tips.filter(t =>  t.used_at)

  return (
    <div className={styles.tipsTab}>
      <div className={styles.tipsAdd}>
        <textarea
          className={styles.tipsTextarea}
          placeholder="Skriv inn en ny tanke…"
          value={newBody}
          onChange={e => setNewBody(e.target.value)}
          rows={3}
        />
        <button className={styles.tipsAddBtn} onClick={handleAdd} disabled={saving || !newBody.trim()}>
          {saving ? 'Lagrer…' : 'Legg til'}
        </button>
      </div>

      {loading ? (
        <div className={styles.empty}>Laster…</div>
      ) : (
        <>
          <div className={styles.tipsSection}>
            <div className={styles.tipsSectionLabel}>Ubrukt ({unused.length})</div>
            {unused.length === 0
              ? <div className={styles.empty}>Ingen ubrukte tips.</div>
              : unused.map(t => <TipRow key={t.id} tip={t} onDelete={handleDelete} />)
            }
          </div>
          <div className={styles.tipsSection}>
            <div className={styles.tipsSectionLabel}>Brukt ({used.length})</div>
            {used.length === 0
              ? <div className={styles.empty}>Ingen brukte tips.</div>
              : used.map(t => <TipRow key={t.id} tip={t} onDelete={handleDelete} />)
            }
          </div>
        </>
      )}
    </div>
  )
}

function TipRow({ tip, onDelete }) {
  const since = timeSinceUsed(tip.used_at)
  return (
    <div className={styles.tipRow}>
      <div className={styles.tipBody}>{tip.body}</div>
      <div className={styles.tipMeta}>
        {since
          ? <span className={styles.tipUsed}>{since}</span>
          : <span className={styles.tipUnused}>Ikke brukt</span>
        }
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onDelete(tip.id)}>
          Slett
        </button>
      </div>
    </div>
  )
}

// DEV ONLY — entire ProsjektDoc component and 'Prosjekt' tab to be removed before prod
function ProsjektDoc({ label, raw }) {
  const [open, setOpen] = useState(true)
  const html = marked.parse(raw)
  return (
    <div className={styles.prosjektDoc}>
      <button className={styles.prosjektDocHeader} onClick={() => setOpen(o => !o)}>
        <span>{open ? '▾' : '▸'}</span>
        <span>{label}</span>
      </button>
      {open && (
        <div
          className={styles.prosjektDocBody}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}

const PER_PAGE_OPTIONS = [10, 25, 50]

export default function AdminPage({ user, onLogout }) {
  const [activeTab, setActiveTab]   = useState('Brukere')
  const [users, setUsers]           = useState([])
  const [total, setTotal]           = useState(0)
  const [memberCount, setMemberCount] = useState(0)
  const [trialCount, setTrialCount]   = useState(0)
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [perPage, setPerPage]       = useState(10)

  const fetchUsers = useCallback(async (p = 1, pp = 10, q = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, per_page: pp })
    if (q) params.set('search', q)
    const res  = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.results)
    setTotal(data.total)
    setMemberCount(data.memberCount)
    setTrialCount(data.trialCount)
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers(1, perPage) }, [fetchUsers, perPage])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers(1, perPage, search) }, 300)
    return () => clearTimeout(timer)
  }, [search, perPage, fetchUsers])

  function handleUpdate(updated) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const countFrom  = total === 0 ? 0 : (page - 1) * perPage + 1
  const countTo    = Math.min(page * perPage, total)

  function goToPage(p) {
    setPage(p)
    fetchUsers(p, perPage, search)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.logo}>Uro</span>
          <span className={styles.adminLabel}>Admin</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerUser}>{user.name}</span>
          <button className={styles.logoutBtn} onClick={onLogout}>Logg ut</button>
        </div>
      </header>

      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {activeTab === 'Brukere' && (
          <>
            <div className={styles.statsRow}>
              {[
                { label: 'Brukere',       value: total },
                { label: 'Medlemmer',     value: memberCount },
                { label: 'Aktive prøver', value: trialCount },
              ].map(({ label, value }) => (
                <div key={label} className={styles.statCard}>
                  <div className={styles.statValue}>{value}</div>
                  <div className={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            <div className={styles.toolbar}>
              <input
                className={styles.search}
                type="text"
                placeholder="Søk etter navn eller e-post…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className={styles.perPageWrapper}>
                <label className={styles.perPageLabel}>Vis</label>
                <select
                  className={styles.perPageSelect}
                  value={perPage}
                  onChange={e => { setPage(1); setPerPage(Number(e.target.value)) }}
                >
                  {PER_PAGE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n} per side</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className={styles.empty}>Laster…</div>
            ) : total === 0 ? (
              <div className={styles.empty}>Ingen brukere funnet.</div>
            ) : (
              <>
                <div className={styles.userList}>
                  {users.map(u => (
                    <UserRow
                      key={u.id}
                      user={u}
                      currentUserId={user.id}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>

                <div className={styles.pagination}>
                  <span className={styles.pageInfo}>
                    {countFrom}–{countTo} av {users.length}
                  </span>
                  <div className={styles.pageControls}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 1}
                    >
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className={styles.pageBtn}
                      onClick={() => goToPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      →
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'Daglige tips' && <TipsTab />}

        {activeTab === 'Innhold' && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>Innholdsadministrasjon</p>
            <p className={styles.placeholderSub}>Ikke implementert ennå.</p>
          </div>
        )}

        {activeTab === 'Prosjekt' && (
          <div className={styles.prosjekt}>
            <ProsjektDoc label="Endringslogg" raw={changelogRaw} />
            <ProsjektDoc label="TODO" raw={todoRaw} />
          </div>
        )}
      </main>
    </div>
  )
}
