import { createContext, useContext, useState, useCallback } from 'react'
import { loadSession, signUp, logIn, logOut } from '../utils/auth'
import { authLogger as log, logUserActivity } from '../utils/logger'
import { useError } from './ErrorContext'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { showError } = useError()
  const [user, setUser] = useState(() => loadSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignUp = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    logUserActivity('auth.signup.submit', { email: credentials.email })
    try {
      const sessionUser = await signUp(credentials)
      setUser(sessionUser)
      logUserActivity('auth.signup.success', { userId: sessionUser.id, email: sessionUser.email })
      log.info({ userId: sessionUser.id }, 'Auth state updated after sign up')
      return sessionUser
    } catch (err) {
      const message = showError(err, { action: 'signUp' })
      setError(message)
      logUserActivity('auth.signup.failure', { email: credentials.email, reason: message })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogIn = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)
    logUserActivity('auth.login.submit', { email: credentials.email })
    try {
      const sessionUser = await logIn(credentials)
      setUser(sessionUser)
      logUserActivity('auth.login.success', { userId: sessionUser.id, email: sessionUser.email })
      log.info({ userId: sessionUser.id }, 'Auth state updated after login')
      return sessionUser
    } catch (err) {
      const message = showError(err, { action: 'logIn' })
      setError(message)
      logUserActivity('auth.login.failure', { email: credentials.email, reason: message })
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleLogOut = useCallback(() => {
    const userId = user?.id
    logUserActivity('auth.logout', { userId }, userId)
    logOut()
    setUser(null)
    setError(null)
    log.info({ userId }, 'Auth state cleared after logout')
  }, [user?.id])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signUp: handleSignUp,
        logIn: handleLogIn,
        logOut: handleLogOut,
        clearError,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
