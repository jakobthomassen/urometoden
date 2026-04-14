import { useState, useEffect } from 'react'
import styles from './App.module.css'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import RightPanel from './components/RightPanel'
import HomePage from './pages/HomePage'
import BibliotekPage from './pages/BibliotekPage'

function getInitialDark() {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function App() {
  const [isDark, setIsDark] = useState(getInitialDark)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activePage, setActivePage] = useState('Hjem')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const showRightPanel = activePage === 'Hjem'

  const gridClass = [
    styles.app,
    sidebarCollapsed ? styles.sidebarCollapsed : '',
    !showRightPanel   ? styles.noRightPanel    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={gridClass}>
      <TopNav
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <Sidebar
        currentWeek={1}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      {activePage === 'Hjem'      && <HomePage />}
      {activePage === 'Bibliotek' && <BibliotekPage />}
      {showRightPanel && <RightPanel />}
    </div>
  )
}
