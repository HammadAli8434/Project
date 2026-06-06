import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logUserActivity } from '../../utils/logger'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import './Auth.css'

function AuthPage() {
  const { clearError } = useAuth()
  const [mode, setMode] = useState('login')

  function switchMode(next) {
    clearError()
    logUserActivity('auth.tab.switch', { from: mode, to: next })
    setMode(next)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon" aria-hidden="true">
            <span className="icon icon-note" />
          </div>
          <h1>My Notes</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Welcome back! Sign in to your account.'
              : 'Create an account to start taking notes.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Log In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm onSwitchToSignup={() => switchMode('signup')} />
        ) : (
          <SignupForm onSwitchToLogin={() => switchMode('login')} />
        )}
      </div>
    </div>
  )
}

export default AuthPage
