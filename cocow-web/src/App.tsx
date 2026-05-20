import { useState, useCallback } from 'react'
import Home from './components/home'
import LoginCallback from './components/LoginCallback'
import UserWebsitesManager from './components/UserWebsitesManager'
import AdminPanel from './components/AdminPanel'
import { redirectToSso } from './api'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user } = useAuth()
  const [showMyWebsites, setShowMyWebsites] = useState(false)
  const isAdmin = user?.localRole === 'ADMIN'

  const handleOpenMyWebsites = useCallback(() => {
    setShowMyWebsites(true)
  }, [])

  const handleCloseMyWebsites = useCallback(() => {
    setShowMyWebsites(false)
  }, [])

  const handleOpenAdmin = useCallback(() => {
    window.history.pushState({}, '', '/admin')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  const handleBackFromAdmin = useCallback(() => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, [])

  if (window.location.pathname === '/login/callback') {
    return <LoginCallback />
  }

  if (window.location.pathname === '/admin' && isAdmin) {
    return <AdminPanel onBack={handleBackFromAdmin} />
  }

  return (
    <>
      <Home
        onLoginClick={redirectToSso}
        onOpenMyWebsites={handleOpenMyWebsites}
        onOpenAdmin={handleOpenAdmin}
      />
      {showMyWebsites && (
        <UserWebsitesManager onClose={handleCloseMyWebsites} />
      )}
    </>
  )
}
