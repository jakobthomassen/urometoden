import { useState, useRef, useEffect } from 'react'
import styles from './TopNav.module.css'

const NAV_TABS = [
  { label: 'Hjem',      active: true  },
  { label: 'Reisen',    active: true  },
  { label: 'Bibliotek', active: true  },
  { label: 'Kurs',      active: false },
  { label: 'Uroskolen', active: false },
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
  { label: 'Profil' },
  { label: 'Innstillinger' },
  { label: 'Personvern' },
  { label: 'Hjelp og støtte' },
  { label: 'Logg ut' },
]

const POPUP_KEYS = ['uro_visited']

function ProfileMenu({ onClose }) {
  const [resetDone, setResetDone] = useState(false)

  function handleReset() {
    POPUP_KEYS.forEach(k => localStorage.removeItem(k))
    setResetDone(true)
    setTimeout(() => setResetDone(false), 2000)
  }

  return (
    <div className={styles.menu}>
      <div className={styles.menuHeader}>
        <div className={styles.menuAvatar}>BL</div>
        <div>
          <div className={styles.menuName}>Bjørn Lie</div>
          <div className={styles.menuEmail}>bjorn@example.com</div>
        </div>
      </div>

      <div className={styles.menuDivider} />

      {MENU_ITEMS.map(item => (
        <button key={item.label} className={styles.menuItem} disabled>
          {item.label}
        </button>
      ))}

      <div className={styles.menuDivider} />

      <button className={styles.menuItemReset} onClick={handleReset}>
        {resetDone ? 'Tilbakestilt ✓' : 'Tilbakestill pop-ups'}
      </button>
    </div>
  )
}

export default function TopNav({ isDark, onToggleTheme, activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

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
      <button className={styles.logo} onClick={() => onNavigate('Hjem')}>Uro</button>

      <div className={styles.navLinks}>
        {NAV_TABS.map(tab => (
          <button
            key={tab.label}
            disabled={!tab.active}
            className={[
              styles.navTab,
              (activePage === tab.label || (tab.label === 'Reisen' && activePage === 'Uke')) ? styles.active : '',
              !tab.active ? styles.disabled : '',
            ].filter(Boolean).join(' ')}
            onClick={() => tab.active && onNavigate(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.navRight}>
        <button
          className={styles.themeToggle}
          onClick={onToggleTheme}
          title={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
        <span className={styles.trialBadge}>7 dager gratis</span>
        <div className={styles.avatarWrapper} ref={menuRef}>
          <button
            className={`${styles.avatar} ${menuOpen ? styles.avatarOpen : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            title="Profil"
          >
            BL
          </button>
          {menuOpen && <ProfileMenu onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </nav>
  )
}
