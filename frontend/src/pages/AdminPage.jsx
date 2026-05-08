import { useState, useEffect, useCallback } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import styles from './AdminPage.module.css'
import AdminContentTab from './AdminContentTab'
import AdminKalenderTab from './AdminKalenderTab'
import AdminLoggTab from './AdminLoggTab'
import UroLogo from '../components/UroLogo'
// DEV ONLY — remove before prod: bundles markdown files into the client build
import changelogRaw from '../../../CHANGELOG.md?raw'
import todoRaw      from '../../../TODO.md?raw'

// DEV ONLY — remove 'Prosjekt' tab before prod
const TABS = ['Brukere', 'Daglige tips', 'Daglige spørsmål', 'Innhold', 'Kalender', 'Logg', 'Prosjekt']
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
  const active = !expiresAt || expiresAt > Date.now()
  if (membership === 'member' && active) {
    return <span className={`${styles.badge} ${styles.badgeMember}`}>Medlem · {formatDate(expiresAt)}</span>
  }
  if (membership === 'trial' && active) {
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
        {!!user.has_used_trial && <span className={`${styles.badge} ${styles.badgeTrialUsed}`}>Prøve brukt</span>}
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
  const used   = tips.filter(t =>  t.used_at).sort((a, b) => b.used_at - a.used_at)

  return (
    <div className={styles.tipsTab}>

      <div className={styles.tipsCallout}>
        <strong>Hvordan fungerer det?</strong> Ett tips sendes automatisk til brukerne hver dag.
        Tips trekkes i rekkefølge fra køen nedenfor. Hold minst 7 tips i kø.
        {unused.length > 0 && <span className={styles.tipsCoverage}> {unused.length} tips = ca. {unused.length} dager dekket.</span>}
      </div>

      <div className={styles.tipsAddSection}>
        <div className={styles.tipsSectionLabel}>Nytt tips</div>
        <div className={styles.tipsAdd}>
          <textarea
            className={styles.tipsTextarea}
            placeholder="Skriv inn en tanke eller refleksjon som sendes til brukerne…"
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            rows={3}
          />
          <button className={styles.tipsAddBtn} onClick={handleAdd} disabled={saving || !newBody.trim()}>
            {saving ? 'Lagrer…' : 'Legg til'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Laster…</div>
      ) : (
        <>
          <div className={styles.tipsSection}>
            <div className={styles.tipsSectionLabel}>
              I kø — vises fremover
              {unused.length === 0 && <span className={styles.tipsWarning}> · Tomt! Legg til tips.</span>}
            </div>
            {unused.length === 0
              ? <div className={styles.empty}>Ingen tips i kø. Legg til nye tips ovenfor.</div>
              : unused.map((t, i) => <TipRow key={t.id} tip={t} isNext={i === 0} onDelete={handleDelete} />)
            }
          </div>
          <div className={styles.tipsSection}>
            <div className={styles.tipsSectionLabel}>Tidligere sendt</div>
            {used.length === 0
              ? <div className={styles.empty}>Ingen tips sendt ennå.</div>
              : used.map(t => <TipRow key={t.id} tip={t} onDelete={handleDelete} />)
            }
          </div>
        </>
      )}
    </div>
  )
}

function TipRow({ tip, isNext = false, onDelete }) {
  const since = timeSinceUsed(tip.used_at)
  return (
    <div className={`${styles.tipRow} ${isNext ? styles.tipRowNext : ''}`}>
      <div className={styles.tipRowLeft}>
        {isNext && <span className={styles.tipNextBadge}>Neste</span>}
        <div className={styles.tipBody}>{tip.body}</div>
      </div>
      <div className={styles.tipMeta}>
        {since && <span className={styles.tipUsed}>{since}</span>}
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onDelete(tip.id)}>
          Slett
        </button>
      </div>
    </div>
  )
}

function DailyPromptsTab() {
  const [prompts, setPrompts]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [newPoolBody, setNewPoolBody] = useState('')
  const [savingPool, setSavingPool]   = useState(false)
  const [poolError, setPoolError]     = useState('')
  const [newOvDate, setNewOvDate]     = useState('')
  const [newOvBody, setNewOvBody]     = useState('')
  const [savingOv, setSavingOv]       = useState(false)
  const [ovError, setOvError]         = useState('')
  const [editId, setEditId]           = useState(null)
  const [editBody, setEditBody]       = useState('')

  const today = new Date().toISOString().slice(0, 10)

  async function fetchPrompts() {
    setLoading(true)
    const res  = await fetch('/api/admin/daily-prompts')
    const data = await res.json()
    setPrompts(data)
    setLoading(false)
  }

  useEffect(() => { fetchPrompts() }, [])

  async function handleAddPool() {
    if (!newPoolBody.trim()) return
    setSavingPool(true)
    setPoolError('')
    const res = await fetch('/api/admin/daily-prompts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ body: newPoolBody }),
    })
    if (!res.ok) { setPoolError('Noe gikk galt.'); setSavingPool(false); return }
    setNewPoolBody('')
    setSavingPool(false)
    fetchPrompts()
  }

  async function handleAddOverride() {
    if (!newOvDate || !newOvBody.trim()) return
    setSavingOv(true)
    setOvError('')
    const res = await fetch('/api/admin/daily-prompts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt_date: newOvDate, body: newOvBody }),
    })
    if (res.status === 409) { setOvError('Den datoen har allerede en override.'); setSavingOv(false); return }
    if (!res.ok)            { setOvError('Noe gikk galt.'); setSavingOv(false); return }
    setNewOvDate('')
    setNewOvBody('')
    setSavingOv(false)
    fetchPrompts()
  }

  async function handleEdit(id) {
    if (!editBody.trim()) return
    await fetch(`/api/admin/daily-prompts/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ body: editBody }),
    })
    setEditId(null)
    setEditBody('')
    fetchPrompts()
  }

  async function handleDelete(id) {
    await fetch(`/api/admin/daily-prompts/${id}`, { method: 'DELETE' })
    setPrompts(prev => prev.filter(p => p.id !== id))
  }

  const pool      = prompts.filter(p => p.prompt_date === null)
  const overrides = prompts.filter(p => p.prompt_date !== null)
  const upcomingOv = overrides.filter(p => p.prompt_date >= today).sort((a, b) => a.prompt_date.localeCompare(b.prompt_date))
  const pastOv     = overrides.filter(p => p.prompt_date <  today).sort((a, b) => b.prompt_date.localeCompare(a.prompt_date))

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const poolUnused   = pool.filter(p => !p.used_at)
  const poolRecent   = pool.filter(p =>  p.used_at && p.used_at >= sevenDaysAgo)
  const poolOld      = pool.filter(p =>  p.used_at && p.used_at <  sevenDaysAgo)

  function rowProps(p) {
    return {
      key:          p.id,
      prompt:       p,
      today,
      isEditing:    editId === p.id,
      editBody,
      onStartEdit:  () => { setEditId(p.id); setEditBody(p.body) },
      onEditChange: setEditBody,
      onSaveEdit:   () => handleEdit(p.id),
      onCancelEdit: () => setEditId(null),
      onDelete:     handleDelete,
    }
  }

  return (
    <div className={styles.tipsTab}>

      <div className={styles.tipsCallout}>
        <strong>Slik fungerer det:</strong> Systemet trekker daglig et tilfeldig spørsmål fra
        spørsmålspoolen med en 7-dagers karantene før gjenbruk.
        {pool.length > 0 && (
          <span className={styles.tipsCoverage}> {pool.length} spørsmål = ca. {pool.length} dager uten gjentakelse.</span>
        )}
        {' '}<strong>Datooverride</strong> tvinger frem et bestemt spørsmål på én valgt dato og overstyrer poolen den dagen.
      </div>

      {/* ── Add to pool ── */}
      <div className={styles.tipsAddSection}>
        <div className={styles.tipsSectionLabel}>Legg til i spørsmålspool</div>
        <div className={styles.tipsAdd}>
          <textarea
            className={styles.tipsTextarea}
            placeholder="Skriv inn et refleksjonsspørsmål som legges i rotasjonen…"
            value={newPoolBody}
            onChange={e => setNewPoolBody(e.target.value)}
            rows={3}
          />
          <button
            className={styles.tipsAddBtn}
            onClick={handleAddPool}
            disabled={savingPool || !newPoolBody.trim()}
          >
            {savingPool ? 'Lagrer…' : 'Legg til i pool'}
          </button>
        </div>
        {poolError && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>{poolError}</div>}
      </div>

      {/* ── Date override ── */}
      <div className={styles.tipsAddSection} style={{ background: 'var(--surface-2, #f5f5f5)', border: '1.5px dashed var(--border)', borderRadius: 10, padding: '14px 16px' }}>
        <div className={styles.tipsSectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          📅 Datooverride
          <span style={{ fontWeight: 400, fontSize: 12, color: 'var(--text-3)' }}>
            — vises alltid på valgt dato, uavhengig av poolen
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 10px' }}>
          Bruk dette for å knytte et spesifikt spørsmål til en bestemt dag (høytider, temauke o.l.).
          Poolen hoppes over den dagen.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
          <input
            type="date"
            className={styles.tipsTextarea}
            style={{ flex: '0 0 160px', resize: 'none', padding: '8px 12px', height: 'auto' }}
            value={newOvDate}
            min={today}
            onChange={e => setNewOvDate(e.target.value)}
          />
        </div>
        <div className={styles.tipsAdd}>
          <textarea
            className={styles.tipsTextarea}
            placeholder="Spørsmål som vises akkurat denne datoen…"
            value={newOvBody}
            onChange={e => setNewOvBody(e.target.value)}
            rows={3}
          />
          <button
            className={styles.tipsAddBtn}
            onClick={handleAddOverride}
            disabled={savingOv || !newOvDate || !newOvBody.trim()}
          >
            {savingOv ? 'Lagrer…' : 'Sett override'}
          </button>
        </div>
        {ovError && <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 6 }}>{ovError}</div>}
      </div>

      {loading ? (
        <div className={styles.empty}>Laster…</div>
      ) : (
        <>
          {/* ── Pool ── */}
          <div className={styles.tipsSection}>
            <div className={styles.tipsSectionLabel}>
              Spørsmålspool
              {pool.length === 0 && <span className={styles.tipsWarning}> · Tom! Legg til spørsmål ovenfor.</span>}
              {poolUnused.length > 0 && <span className={styles.tipsCoverage}> · {poolUnused.length} ubrukte</span>}
            </div>
            {pool.length === 0
              ? <div className={styles.empty}>Ingen spørsmål i pool. Legg til ovenfor.</div>
              : [...poolUnused, ...poolRecent, ...poolOld].map(p => <DailyPromptRow {...rowProps(p)} />)
            }
          </div>

          {/* ── Date overrides ── */}
          {overrides.length > 0 && (
            <div className={styles.tipsSection}>
              <div className={styles.tipsSectionLabel}>Datooverrides</div>
              {upcomingOv.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kommende</div>
                  {upcomingOv.map(p => <DailyPromptRow {...rowProps(p)} />)}
                </>
              )}
              {pastOv.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tidligere</div>
                  {pastOv.map(p => <DailyPromptRow {...rowProps(p)} />)}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function DailyPromptRow({ prompt, today, isEditing, editBody, onStartEdit, onEditChange, onSaveEdit, onCancelEdit, onDelete }) {
  const isOverride   = prompt.prompt_date != null
  const isToday      = isOverride && prompt.prompt_date === today
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const isRecent     = !isOverride && prompt.used_at && prompt.used_at >= sevenDaysAgo

  return (
    <div className={`${styles.tipRow} ${isToday ? styles.tipRowNext : ''}`}>
      <div className={styles.tipRowLeft} style={{ flex: 1 }}>
        {isToday  && <span className={styles.tipNextBadge}>I dag</span>}
        {isRecent && <span className={styles.tipNextBadge} style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>Nylig brukt</span>}
        {!prompt.used_at && !isOverride && <span className={styles.tipNextBadge} style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>Ubrukt</span>}
        {isOverride && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{prompt.prompt_date}</div>}
        {!isOverride && prompt.used_date && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Sist brukt: {prompt.used_date}</div>}
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <textarea
              className={styles.tipsTextarea}
              value={editBody}
              onChange={e => onEditChange(e.target.value)}
              rows={3}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={styles.tipsAddBtn} onClick={onSaveEdit} disabled={!editBody.trim()}>Lagre</button>
              <button className={styles.btn} onClick={onCancelEdit}>Avbryt</button>
            </div>
          </div>
        ) : (
          <div className={styles.tipBody}>{prompt.body}</div>
        )}
      </div>
      {!isEditing && (
        <div className={styles.tipMeta}>
          <button className={styles.btn} onClick={onStartEdit}>Rediger</button>
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onDelete(prompt.id)}>Slett</button>
        </div>
      )}
    </div>
  )
}

// DEV ONLY — entire ProsjektDoc component and 'Prosjekt' tab to be removed before prod
function ProsjektDoc({ label, raw }) {
  const [open, setOpen] = useState(true)
  const html = DOMPurify.sanitize(marked.parse(raw))
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
          <a className={styles.logo} href="/" title="Tilbake til appen" aria-label="Uro — tilbake til appen">
            <UroLogo className={styles.logoSvg} />
          </a>
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

        {activeTab === 'Daglige spørsmål' && <DailyPromptsTab />}

        {activeTab === 'Innhold' && <AdminContentTab />}

        {activeTab === 'Kalender' && <AdminKalenderTab />}

        {activeTab === 'Logg' && <AdminLoggTab />}

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
