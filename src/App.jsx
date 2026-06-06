import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import AuthPage from './components/auth/AuthPage'
import NotesApp from './components/NotesApp'
import { logEvent } from './utils/logger'
import './App.css'

function App() {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      logEvent('app.view.notes', { userId: user.id }, 'Notes dashboard displayed')
    } else {
      logEvent('app.view.auth', {}, 'Auth page displayed')
    }
  }, [isAuthenticated, user?.id])

  return isAuthenticated ? <NotesApp /> : <AuthPage />
}

export default App
