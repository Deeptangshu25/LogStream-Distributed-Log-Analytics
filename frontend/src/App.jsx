import { useState } from 'react'
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'

import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'

import Dashboard from './pages/Dashboard'
import LiveTail from './pages/LiveTail'
import SearchLogs from './pages/SearchLogs'
import Analytics from './pages/Analytics'
import Alerts from './pages/Alerts'

const pageInfo = {
  '/': {
    title: 'Dashboard',
    description: 'Monitor and analyze your application logs.',
  },

  '/live': {
    title: 'Live Tail',
    description: 'View incoming logs in real time.',
  },

  '/search': {
    title: 'Search Logs',
    description: 'Search and filter indexed logs.',
  },

  '/analytics': {
    title: 'Analytics',
    description: 'Analyze log volume, errors, and services.',
  },

  '/alerts': {
    title: 'Alerts',
    description: 'Monitor configured log alerts.',
  },
}

function App() {
  const location = useLocation()

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Settings modal state
  const [settingsOpen, setSettingsOpen] = useState(false)

  const currentPage =
    pageInfo[location.pathname] ?? pageInfo['/']

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onSettings={() => setSettingsOpen(true)}
      />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ease-in-out
          ${
            sidebarCollapsed
              ? 'ml-[76px]'
              : 'ml-64'
          }
        `}
      >

        {/* =======================================
            TOP HEADER
        ======================================= */}

        <header className="border-b border-slate-800/80 bg-slate-950/70 px-8 py-6 backdrop-blur-xl">

          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {currentPage.title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {currentPage.description}
              </p>
            </div>

            {/* Current route indicator */}

            <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 lg:flex">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />

              <span className="font-mono text-[10px] text-slate-600">
                {location.pathname}
              </span>

            </div>

          </div>

        </header>

        {/* =======================================
            PAGE CONTENT
        ======================================= */}

        <div className="p-8">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/live"
              element={<LiveTail />}
            />

            <Route
              path="/search"
              element={<SearchLogs />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/alerts"
              element={<Alerts />}
            />

          </Routes>

        </div>

      </main>

      {/* =========================================
          SETTINGS MODAL
      ========================================= */}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

    </div>
  )
}

export default App