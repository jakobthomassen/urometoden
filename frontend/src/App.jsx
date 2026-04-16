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
import { useWeekProgress } from './hooks/useWeekProgress'

function getInitialDark() {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [user, setUser]                         = useState(undefined) // undefined=loading, null=unauthed, obj=authed
  const [isDark, setIsDark]                     = useState(getInitialDark)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage]             = useState('Hjem')
  const [activeWeek, setActiveWeek]             = useState(1)
  const [bibliotekFilter, setBibliotekFilter]   = useState('all')
  const { weeks, refresh: refreshProgress }     = useWeekProgress()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(u => setUser(u))
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  function navigate(page, data) {
    setActivePage(page)
    if (page === 'Bibliotek' && data) setBibliotekFilter(data)
    if (page === 'Uke' && data)       setActiveWeek(data)
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
      />
      <Sidebar
        weeks={weeks}
        currentWeek={activeWeek}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onNavigate={navigate}
      />
      {activePage === 'Hjem'      && <DashboardPage weeks={weeks} onNavigateToWeek={navigateToWeek} />}
      {activePage === 'Reisen'    && <JourneyPage weeks={weeks} onNavigateToWeek={navigateToWeek} />}
      {activePage === 'Uke'       && <HomePage weekId={activeWeek} onProgressChange={refreshProgress} />}
      {activePage === 'Bibliotek' && <BibliotekPage initialFilter={bibliotekFilter} />}
      {showRightPanel && <RightPanel />}
    </div>
  )
}
