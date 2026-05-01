import { useState, useRef, useEffect } from 'react'
import styles from './TopNav.module.css'
import UroLogo from './UroLogo'

const NAV_TABS = [
  { label: 'Hjem',      active: true  },
  { label: 'Reisen',    active: true  },
  { label: 'Bibliotek', active: true  },
  { label: 'Kurs',      active: false },
]

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"     x2="12" y2="3" />
      <line x1="12" y1="21"    x2="12" y2="23" />
      <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12"    x2="3"  y2="12" />
      <line x1="21" y1="12"    x2="23" y2="12" />
      <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

const MENU_ITEMS = [
  { label: 'Profil',         disabled: true  },
  { label: 'Innstillinger',  disabled: true  },
  { label: 'Personvern',     disabled: false, page: 'Hjelp', section: 'personvern' },
  { label: 'Hjelp og støtte', disabled: false, page: 'Hjelp', section: 'hjelp' },
]

function resetLocalStorage() {
  localStorage.removeItem('uro_visited')
  localStorage.removeItem('week_progress')
  Object.keys(localStorage)
    .filter(k => k.startsWith('reflection_'))
    .forEach(k => localStorage.removeItem(k))
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

function ProfileMenu({ user, onClose, onLogout, onNavigate }) {
  const [resetDone, setResetDone] = useState(false)

  function handleReset() {
    resetLocalStorage()
    setResetDone(true)
    setTimeout(() => setResetDone(false), 2000)
  }

  return (
    <div className={styles.menu}>
      <div className={styles.menuHeader}>
        <div className={styles.menuAvatar}>{getInitials(user.name)}</div>
        <div>
          <div className={styles.menuName}>{user.name}</div>
          <div className={styles.menuEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.menuDivider} />

      {MENU_ITEMS.map(item => (
        <button
          key={item.label}
          className={item.disabled ? styles.menuItem : styles.menuItemActive}
          disabled={item.disabled}
          onClick={item.disabled ? undefined : () => { onClose(); onNavigate(item.page, item.section) }}
        >
          {item.label}
        </button>
      ))}

      <div className={styles.menuDivider} />

      <button className={styles.menuItemReset} onClick={handleReset}>
        {resetDone ? 'Tilbakestilt ✓' : 'Nullstill kursdata'}
      </button>
      <button className={styles.menuItemLogout} onClick={() => { onClose(); onLogout() }}>
        Logg ut
      </button>
    </div>
  )
}

function useMembershipLabel(user) {
  const [label, setLabel] = useState('')
  const [type, setType]   = useState('none')

  useEffect(() => {
    function compute() {
      const { membership, membership_expires_at: exp } = user ?? {}
      if (membership === 'member') {
        setLabel('Medlem'); setType('member'); return
      }
      if (membership === 'trial' && exp > Date.now()) {
        const ms    = exp - Date.now()
        const hours = ms / (1000 * 60 * 60)
        if (hours < 24) {
          setLabel(`${Math.ceil(hours)}t igjen`)
        } else {
          setLabel(`${Math.ceil(hours / 24)} dager igjen`)
        }
        setType('trial')
        return
      }
      setLabel('Ikke medlem'); setType('none')
    }
    compute()
    const id = setInterval(compute, 60_000)
    return () => clearInterval(id)
  }, [user])

  return { label, type }
}

export default function TopNav({ isDark, onToggleTheme, activePage, onNavigate, user, onLogout, memberAccess }) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const menuRef                     = useRef(null)
  const { label: memberLabel, type: memberType } = useMembershipLabel(user)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <nav className={styles.topnav}>
      <button className={styles.logo} onClick={() => onNavigate('Hjem')} aria-label="Hjem">
        <UroLogo className={styles.logoSvg} />
      </button>

      <div className={styles.navLinks}>
        {NAV_TABS.map(tab => {
          const gated = !memberAccess && (tab.label === 'Reisen' || tab.label === 'Bibliotek')
          return (
            <button
              key={tab.label}
              disabled={!tab.active}
              className={[
                styles.navTab,
                (activePage === tab.label || (tab.label === 'Reisen' && activePage === 'Uke')) ? styles.active : '',
                !tab.active ? styles.disabled : '',
                gated ? styles.gated : '',
              ].filter(Boolean).join(' ')}
              onClick={() => tab.active && onNavigate(tab.label)}
            >
              {tab.label}{gated ? ' 🔒' : ''}
            </button>
          )
        })}
      </div>

      <div className={styles.navRight}>
        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          className={`${styles.memberBadge} ${styles[`memberBadge_${memberType}`]}`}
          onClick={() => alert('Her vil du bli sendt til fakturasiden. Denne siden er ikke tilgjengelig ennå.')}
        >
          {memberLabel}
        </button>
        <div className={styles.avatarWrapper} ref={menuRef}>
          <button
            className={`${styles.avatar} ${menuOpen ? styles.avatarOpen : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            title="Profil"
          >
            {getInitials(user?.name)}
          </button>
          {menuOpen && (
            <ProfileMenu
              user={user}
              onClose={() => setMenuOpen(false)}
              onLogout={onLogout}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>
    </nav>
  )
}
