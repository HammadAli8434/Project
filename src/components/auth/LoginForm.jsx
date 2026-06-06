import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logUserActivity } from '../../utils/logger'

function LoginForm({ onSwitchToSignup }) {
  const { logIn, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await logIn({ email, password })
    } catch {
      // error shown via context
    }
  }

  function handleChange(setter) {
    return (e) => {
      clearError()
      setter(e.target.value)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
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
        <label className="auth-label" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          className="auth-input"
          placeholder="Your password"
          value={password}
          onChange={handleChange(setPassword)}
          autoComplete="current-password"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Log In'}
      </button>

      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            logUserActivity('auth.navigate.signup')
            onSwitchToSignup()
          }}
        >
          Sign up
        </button>
      </p>
    </form>
  )
}

export default LoginForm
