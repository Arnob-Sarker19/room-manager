import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import RoomFund from './pages/RoomFund'
import CleaningSchedule from './pages/CleaningSchedule'
import WifiBilling from './pages/WifiBilling'
import Members from './pages/Members'
import ChatRoom from './pages/ChatRoom'
import NotificationsPanel from './pages/NotificationsPanel'
import ProfileSettings from './pages/ProfileSettings'
import ProtectedRoute from './pages/ProtectedRoute'
import { supabase } from './lib/supabase'

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/fund', label: 'Fund', icon: '💰' },
  { to: '/cleaning', label: 'Clean', icon: '🧹' },
  { to: '/wifi', label: 'Wifi', icon: '📶' },
  { to: '/members', label: 'People', icon: '👥' },
  { to: '/chat', label: 'Chat', icon: '💬' },
  { to: '/notifications', label: 'Alerts', icon: '🔔' },
  { to: '/profile', label: 'Profile', icon: '⚙️' },
]

function AppShell(){
  const location = useLocation()
  const [darkMode, setDarkMode] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem('room-theme')
    if (stored === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }

    const timer = window.setTimeout(() => setShowSplash(false), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    window.localStorage.setItem('room-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const animatedKey = useMemo(() => location.pathname, [location.pathname])
  const isAuthenticated = !!session

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {showSplash && (
        <div className="splash">
          <div className="splash-card">
            <div className="text-4xl font-bold">🏠</div>
            <div className="mt-2 text-xl font-semibold">Smart Room</div>
            <div className="text-sm opacity-80">Hostel Manager</div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-blue-600">Smart Room</div>
            <div className="text-lg font-semibold">Hostel Manager</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="secondary px-3 py-2" onClick={() => setDarkMode((value) => !value)}>{darkMode ? '☀️' : '🌙'}</button>
            {isAuthenticated ? (
              <button className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white" onClick={() => supabase.auth.signOut()}>Logout</button>
            ) : (
              <Link to="/login" className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Login</Link>
            )}
          </div>
        </div>
      </header>

      <main key={animatedKey} className="mx-auto max-w-5xl px-4 py-4 pb-24 page-enter page-enter-active">
        <Routes>
          <Route path="/" element={isAuthenticated ? <Dashboard/> : <Navigate to="/login" replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login/>} />
          <Route path="/fund" element={<ProtectedRoute isAuthenticated={isAuthenticated}><RoomFund/></ProtectedRoute>} />
          <Route path="/cleaning" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CleaningSchedule/></ProtectedRoute>} />
          <Route path="/wifi" element={<ProtectedRoute isAuthenticated={isAuthenticated}><WifiBilling/></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Members/></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ChatRoom/></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute isAuthenticated={isAuthenticated}><NotificationsPanel/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ProfileSettings/></ProtectedRoute>} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/90 px-2 py-2 backdrop-blur">
        <div className="mx-auto flex max-w-5xl justify-around">
          {navItems.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} className={`flex flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold ${active ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function App(){
  return <AppShell />
}
