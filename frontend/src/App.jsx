import { useState, useEffect } from 'react'
import styles from './App.module.css'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import DashboardPage from './pages/DashboardPage'
import JourneyPage from './pages/JourneyPage'
import HomePage from './pages/HomePage'
import BibliotekPage from './pages/BibliotekPage'
import WelcomeModal from './components/WelcomeModal'
import OnboardingPage from './pages/OnboardingPage'
import AdminPage from './pages/AdminPage'
import HelpPage from './pages/HelpPage'
import { useWeekProgress } from './hooks/useWeekProgress'
import { isMember } from './utils/membership'

function getInitialDark() {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const hint = JSON.parse(localStorage.getItem('user_hint') || 'null')
      return hint !== null ? hint : undefined  // hint present → optimistic render; absent → show loading
    } catch { return undefined }
  })
  const [isDark, setIsDark]                     = useState(getInitialDark)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage]             = useState('Hjem')
  const [activeWeek, setActiveWeek]             = useState(1)
  const [bibliotekFilter, setBibliotekFilter]   = useState('all')
  const [helpSection, setHelpSection]           = useState('hjelp')
  const { weeks, refresh: refreshProgress }     = useWeekProgress()
  const memberAccess = isMember(user)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => {
        setUser(u)
        if (u) localStorage.setItem('user_hint', JSON.stringify({
          name:                  u.name,
          display_name:          u.display_name,
          is_admin:              u.is_admin,
          membership:            u.membership,
          membership_expires_at: u.membership_expires_at,
        }))
        else   localStorage.removeItem('user_hint')
      })
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user_hint')
    setUser(null)
  }

  function navigate(page, data) {
    if (!memberAccess && (page === 'Reisen' || page === 'Bibliotek' || page === 'Uke')) {
      alert('Reisen og biblioteket er tilgjengelig for medlemmer og brukere i prøveperiode.')
      return
    }
    setActivePage(page)
    if (page === 'Bibliotek' && data) setBibliotekFilter(data)
    if (page === 'Uke'       && data) setActiveWeek(data)
    if (page === 'Hjelp'     && data) setHelpSection(data)
  }

  function navigateToWeek(weekId) {
    navigate('Uke', weekId)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  if (user === undefined) return null
  if (user === null) return <OnboardingPage />

  if (window.location.pathname === '/admin') {
    if (!user.is_admin) { window.location.replace('/'); return null }
    return <AdminPage user={user} onLogout={handleLogout} />
  }

  const showRightPanel = activePage === 'Hjem' || activePage === 'Uke' || activePage === 'Reisen'

  const gridClass = [
    styles.app,
    sidebarCollapsed ? styles.sidebarCollapsed : '',
    !showRightPanel   ? styles.noRightPanel    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={gridClass}>
      <WelcomeModal onStart={() => navigateToWeek(1)} />
      <TopNav
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        activePage={activePage}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
        memberAccess={memberAccess}
      />
      <Sidebar
        weeks={weeks}
        currentWeek={activeWeek}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onNavigate={navigate}
        memberAccess={memberAccess}
      />
      {activePage === 'Hjem'      && <DashboardPage weeks={weeks} onNavigateToWeek={navigateToWeek} user={user} />}
      {activePage === 'Reisen'    && <JourneyPage weeks={weeks} onNavigateToWeek={navigateToWeek} />}
      {activePage === 'Uke'       && <HomePage weekId={activeWeek} onProgressChange={refreshProgress} />}
      {activePage === 'Bibliotek' && <BibliotekPage initialFilter={bibliotekFilter} />}
      {activePage === 'Hjelp'     && <HelpPage section={helpSection} />}
      {showRightPanel && <RightPanel />}
    </div>
  )
}
