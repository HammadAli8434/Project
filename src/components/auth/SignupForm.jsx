import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logUserActivity } from '../../utils/logger'

function SignupForm({ onSwitchToLogin }) {
  const { signUp, loading, error, clearError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [localError, setLocalError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      logUserActivity('auth.signup.validation_failure', { reason: 'password_mismatch' })
      return
    }

    try {
      await signUp({ name, email, password })
    } catch {
      // error shown via context
    }
  }

  function handleChange(setter) {
    return (e) => {
      clearError()
      setLocalError(null)
      setter(e.target.value)
    }
  }

  const displayError = localError || error

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {displayError && <div className="auth-error" role="alert">{displayError}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-name">Name</label>
        <input
          id="signup-name"
          type="text"
          className="auth-input"
          placeholder="Your name"
          value={name}
          onChange={handleChange(setName)}
          autoComplete="name"
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          className="auth-input"
          placeholder="you@example.com"
          value={email}
          onChange={handleChange(setEmail)}
          autoComplete="email"
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          className="auth-input"
          placeholder="At least 6 characters"
          value={password}
          onChange={handleChange(setPassword)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="signup-confirm">Confirm Password</label>
        <input
          id="signup-confirm"
          type="password"
          className="auth-input"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={handleChange(setConfirmPassword)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            logUserActivity('auth.navigate.login')
            onSwitchToLogin()
          }}
        >
          Log in
        </button>
      </p>
    </form>
  )
}

export default SignupForm
