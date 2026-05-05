import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useMatch, useParams } from 'react-router-dom'
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
import KursPage from './pages/KursPage'
import { useWeekProgress } from './hooks/useWeekProgress'
import { useUserProgress } from './hooks/useUserProgress'
import { isMember } from './utils/membership'

function getInitialDark() {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function LockedWeekView({ week }) {
  const days = week?.daysUntilUnlock
  return (
    <main style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg)' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Uke {week?.id} av 8
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
        {week?.title}
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-3)', fontSize: '14px', marginTop: '4px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {days === 0
          ? 'Åpner i dag kl. 10:00'
          : days === 1
          ? 'Åpner i morgen kl. 10:00'
          : `Åpner om ${days} dager`}
      </div>
    </main>
  )
}

function WeekPage({ memberAccess, weeks, progressLoaded, progressData, startWeekDb, updateProgress, updateReflection, devUnlockWeek, refreshProgress, isAdmin, reflectionConsent, grantReflectionConsent }) {
  const { weekId: raw } = useParams()
  const routerNav = useNavigate()
  const weekId = parseInt(raw)

  if (!memberAccess) return <Navigate to="/" replace />
  if (!Number.isFinite(weekId) || weekId < 1 || weekId > 8) return <Navigate to="/praksis" replace />

  const week = weeks.find(w => w.id === weekId)
  if (progressLoaded && week?.status === 'locked') return <LockedWeekView week={week} />

  return (
    <HomePage
      weekId={weekId}
      weeks={weeks}
      progress={progressData.progress}
      reflections={progressData.reflections}
      startWeek={startWeekDb}
      updateProgress={updateProgress}
      updateReflection={updateReflection}
      devUnlockWeek={devUnlockWeek}
      onProgressChange={refreshProgress}
      onNavigateToWeek={id => routerNav(`/praksis/uke/${id}`)}
      isAdmin={isAdmin}
      reflectionConsent={reflectionConsent}
      grantReflectionConsent={grantReflectionConsent}
    />
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const hint = JSON.parse(localStorage.getItem('user_hint') || 'null')
      return hint !== null ? hint : undefined
    } catch { return undefined }
  })
  const [isDark, setIsDark]                     = useState(getInitialDark)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [bibliotekFilter, setBibliotekFilter]   = useState('all')
  const [helpSection, setHelpSection]           = useState('hjelp')

  const routerNav    = useNavigate()
  const location     = useLocation()
  const weekMatch    = useMatch('/praksis/uke/:weekId')
  const currentWeek  = weekMatch ? (parseInt(weekMatch.params.weekId) || null) : null
  const memberAccess = isMember(user)

  const {
    data:                  progressData,
    stats,
    loaded:                progressLoaded,
    startWeek:             startWeekDb,
    devUnlockWeek,
    updateProgress,
    updateReflection,
    grantReflectionConsent,
    reflectionConsent,
    refresh:               refreshProgress,
  } = useUserProgress()

  const { weeks } = useWeekProgress(progressData.weeks)

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
        else localStorage.removeItem('user_hint')
      })
      .catch(() => setUser(null))
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('user_hint')
    setUser(null)
  }

  function navigate(page, data) {
    if (!memberAccess && (page === 'Praksis' || page === 'Reisen' || page === 'Bibliotek' || page === 'Uke')) {
      alert('Praksis og biblioteket er tilgjengelig for medlemmer og brukere i prøveperiode.')
      return
    }
    if (page === 'Hjem')                         return routerNav('/')
    if (page === 'Praksis' || page === 'Reisen') return routerNav('/praksis')
    if (page === 'Bibliotek') { if (data) setBibliotekFilter(data); return routerNav('/bibliotek') }
    if (page === 'Kurs')                         return routerNav('/kurs')
    if (page === 'Hjelp')    { if (data) setHelpSection(data);     return routerNav('/hjelp') }
    if (page === 'Uke')                          return routerNav(`/praksis/uke/${data}`)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  if (user === undefined) return null
  if (user === null) return <OnboardingPage />

  if (location.pathname.startsWith('/admin')) {
    if (!user.is_admin) return <Navigate to="/" replace />
    return <AdminPage user={user} onLogout={handleLogout} />
  }

  const showRightPanel = location.pathname === '/' || location.pathname.startsWith('/praksis')

  const gridClass = [
    styles.app,
    sidebarCollapsed ? styles.sidebarCollapsed : '',
    !showRightPanel  ? styles.noRightPanel    : '',
  ].filter(Boolean).join(' ')

  const weekPageProps = {
    memberAccess, weeks, progressLoaded, progressData,
    startWeekDb, updateProgress, updateReflection, devUnlockWeek,
    refreshProgress, isAdmin: !!user.is_admin,
    reflectionConsent, grantReflectionConsent,
  }

  return (
    <div className={gridClass}>
      <WelcomeModal onStart={() => routerNav('/praksis/uke/1')} />
      <TopNav
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        onNavigate={navigate}
        user={user}
        onLogout={handleLogout}
        memberAccess={memberAccess}
      />
      <Sidebar
        weeks={weeks}
        currentWeek={currentWeek}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        onNavigate={navigate}
        memberAccess={memberAccess}
      />
      <Routes>
        <Route path="/" element={
          <DashboardPage weeks={weeks} onNavigateToWeek={id => routerNav(`/praksis/uke/${id}`)} user={user} />
        } />
        <Route path="/praksis" element={
          memberAccess
            ? <JourneyPage weeks={weeks} onNavigateToWeek={id => routerNav(`/praksis/uke/${id}`)} />
            : <Navigate to="/" replace />
        } />
        <Route path="/praksis/uke/:weekId" element={<WeekPage {...weekPageProps} />} />
        <Route path="/bibliotek" element={
          memberAccess
            ? <BibliotekPage
                initialFilter={bibliotekFilter}
                progress={progressData.progress}
                reflections={progressData.reflections}
                updateProgress={updateProgress}
                updateReflection={updateReflection}
                reflectionConsent={reflectionConsent}
                grantReflectionConsent={grantReflectionConsent}
              />
            : <Navigate to="/" replace />
        } />
        <Route path="/kurs" element={<KursPage />} />
        <Route path="/hjelp" element={<HelpPage section={helpSection} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showRightPanel && <RightPanel stats={stats} weeks={weeks} />}
    </div>
  )
}
