import {
  authLogger as log,
  logError,
  logStorageRequest,
  logStorageResponse,
  logEvent,
} from './logger'

const USERS_KEY = 'notes-app-users'
const SESSION_KEY = 'notes-app-session'

export function getNotesKey(userId) {
  return `notes-app-data-${userId}`
}

async function hashPassword(password, email) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers() {
  logStorageRequest('GET', USERS_KEY)
  try {
    const saved = localStorage.getItem(USERS_KEY)
    const users = saved ? JSON.parse(saved) : []
    logStorageResponse('GET', USERS_KEY, true, { userCount: users.length })
    return users
  } catch (err) {
    logStorageResponse('GET', USERS_KEY, false, { err: err.message })
    logError(err, { operation: 'loadUsers', key: USERS_KEY }, 'Failed to load users')
    return []
  }
}

function saveUsers(users) {
  logStorageRequest('SET', USERS_KEY, { userCount: users.length })
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    logStorageResponse('SET', USERS_KEY, true, { userCount: users.length })
    log.debug({ userCount: users.length }, 'Users saved to storage')
  } catch (err) {
    logStorageResponse('SET', USERS_KEY, false, { err: err.message })
    logError(err, { operation: 'saveUsers', key: USERS_KEY }, 'Failed to save users')
    throw err
  }
}

export function loadSession() {
  logStorageRequest('GET', SESSION_KEY)
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    const session = saved ? JSON.parse(saved) : null
    logStorageResponse('GET', SESSION_KEY, true, { hasSession: Boolean(session) })
    if (session) {
      logEvent('auth.session.restored', { userId: session.id, email: session.email })
      log.info({ userId: session.id, email: session.email }, 'Session restored')
    } else {
      log.debug('No active session found')
    }
    return session
  } catch (err) {
    logStorageResponse('GET', SESSION_KEY, false, { err: err.message })
    logError(err, { operation: 'loadSession', key: SESSION_KEY }, 'Failed to load session')
    return null
  }
}

function saveSession(user) {
  logStorageRequest('SET', SESSION_KEY, { userId: user.id })
  try {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: user.id, name: user.name, email: user.email })
    )
    logStorageResponse('SET', SESSION_KEY, true, { userId: user.id })
    logEvent('auth.session.saved', { userId: user.id })
    log.debug({ userId: user.id }, 'Session saved')
  } catch (err) {
    logStorageResponse('SET', SESSION_KEY, false, { err: err.message })
    logError(err, { operation: 'saveSession', userId: user.id }, 'Failed to save session')
    throw err
  }
}

export function clearSession() {
  logStorageRequest('REMOVE', SESSION_KEY)
  try {
    localStorage.removeItem(SESSION_KEY)
    logStorageResponse('REMOVE', SESSION_KEY, true)
    logEvent('auth.session.cleared')
    log.info('Session cleared')
  } catch (err) {
    logStorageResponse('REMOVE', SESSION_KEY, false, { err: err.message })
    logError(err, { operation: 'clearSession' }, 'Failed to clear session')
  }
}

export async function signUp({ name, email, password }) {
  const trimmedName = name.trim()
  const trimmedEmail = email.trim().toLowerCase()

  log.info({ email: trimmedEmail }, 'Sign up attempt')

  if (!trimmedName || !trimmedEmail || !password) {
    log.warn({ email: trimmedEmail }, 'Sign up failed: missing fields')
    throw new Error('All fields are required.')
  }

  if (password.length < 6) {
    log.warn({ email: trimmedEmail }, 'Sign up failed: password too short')
    throw new Error('Password must be at least 6 characters.')
  }

  const users = loadUsers()
  if (users.some((u) => u.email === trimmedEmail)) {
    log.warn({ email: trimmedEmail }, 'Sign up failed: email already exists')
    throw new Error('An account with this email already exists.')
  }

  const passwordHash = await hashPassword(password, trimmedEmail)
  const user = {
    id: crypto.randomUUID(),
    name: trimmedName,
    email: trimmedEmail,
    passwordHash,
    createdAt: Date.now(),
  }

  saveUsers([...users, user])
  saveSession(user)

  log.info({ userId: user.id, email: user.email }, 'User signed up successfully')
  return { id: user.id, name: user.name, email: user.email }
}

export async function logIn({ email, password }) {
  const trimmedEmail = email.trim().toLowerCase()

  log.info({ email: trimmedEmail }, 'Login attempt')

  if (!trimmedEmail || !password) {
    log.warn({ email: trimmedEmail }, 'Login failed: missing credentials')
    throw new Error('Email and password are required.')
  }

  const users = loadUsers()
  const user = users.find((u) => u.email === trimmedEmail)

  if (!user) {
    log.warn({ email: trimmedEmail }, 'Login failed: user not found')
    throw new Error('Invalid email or password.')
  }

  const passwordHash = await hashPassword(password, trimmedEmail)
  if (user.passwordHash !== passwordHash) {
    log.warn({ userId: user.id, email: trimmedEmail }, 'Login failed: invalid password')
    throw new Error('Invalid email or password.')
  }

  saveSession(user)

  log.info({ userId: user.id, email: user.email }, 'User logged in successfully')
  return { id: user.id, name: user.name, email: user.email }
}

export function logOut() {
  log.info('User logged out')
  clearSession()
}
