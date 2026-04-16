import { useState, useEffect, useCallback } from 'react'
import styles from './AdminPage.module.css'

const TABS = ['Brukere', 'Daglige tips', 'Innhold']
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

export default function AdminPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('Brukere')
  const [users, setUsers]         = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)

  const fetchUsers = useCallback(async (q = '') => {
    setLoading(true)
    const res  = await fetch(`/api/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`)
    const data = await res.json()
    setUsers(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchUsers])

  function handleUpdate(updated) {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u))
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
            <input
              className={styles.search}
              type="text"
              placeholder="Søk etter navn eller e-post…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {loading ? (
              <div className={styles.empty}>Laster…</div>
            ) : users.length === 0 ? (
              <div className={styles.empty}>Ingen brukere funnet.</div>
            ) : (
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
            )}
          </>
        )}

        {activeTab === 'Daglige tips' && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>Daglige tips</p>
            <p className={styles.placeholderSub}>Ikke implementert ennå.</p>
          </div>
        )}

        {activeTab === 'Innhold' && (
          <div className={styles.placeholder}>
            <p className={styles.placeholderTitle}>Innholdsadministrasjon</p>
            <p className={styles.placeholderSub}>Ikke implementert ennå.</p>
          </div>
        )}
      </main>
    </div>
  )
}
