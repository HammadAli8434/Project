import pino from 'pino'

const logger = pino({
  name: 'notes-app',
  level: import.meta.env.DEV ? 'debug' : 'info',
  browser: {
    asObject: true,
    write: (o) => {
      const method =
        o.level >= 50 ? 'error' : o.level >= 40 ? 'warn' : o.level >= 30 ? 'info' : 'debug'
      console[method](o)
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: import.meta.env.MODE,
  },
})

export function createLogger(module) {
  return logger.child({ module })
}

export const appLogger = createLogger('app')
export const authLogger = createLogger('auth')
export const notesLogger = createLogger('notes')
export const httpLogger = createLogger('http')
export const activityLogger = createLogger('activity')
export const errorLogger = createLogger('error')

function serializeError(err) {
  if (!err) return { message: 'Unknown error' }
  if (typeof err === 'string') return { message: err }
  return {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
  }
}

function sanitizeBody(body) {
  if (!body) return undefined
  if (typeof body === 'string') return { size: body.length }
  try {
    const copy = { ...body }
    const sensitive = ['password', 'passwordHash', 'confirmPassword', 'token', 'authorization']
    for (const key of sensitive) {
      if (key in copy) copy[key] = '[REDACTED]'
    }
    return copy
  } catch {
    return { size: String(body).length }
  }
}

export function logEvent(event, data = {}, message) {
  appLogger.info({ event, ...data }, message ?? `Event: ${event}`)
}

export function logError(err, context = {}, message = 'An error occurred') {
  errorLogger.error(
    { event: 'error', err: serializeError(err), ...context },
    message
  )
}

export function logUserActivity(action, details = {}, userId) {
  activityLogger.info(
    {
      event: 'user.activity',
      action,
      userId: userId ?? details.userId,
      ...details,
    },
    `User activity: ${action}`
  )
}

export function logHttpRequest({ method, url, headers, body, requestId }) {
  httpLogger.info(
    {
      event: 'http.request',
      requestId,
      method: method?.toUpperCase(),
      url,
      headers: headers ? sanitizeHeaders(headers) : undefined,
      body: sanitizeBody(body),
    },
    `HTTP ${method?.toUpperCase()} ${url}`
  )
}

export function logHttpResponse({
  method,
  url,
  status,
  statusText,
  durationMs,
  headers,
  body,
  requestId,
  ok,
}) {
  const payload = {
    event: 'http.response',
    requestId,
    method: method?.toUpperCase(),
    url,
    status,
    statusText,
    durationMs,
    ok,
    headers: headers ? sanitizeHeaders(headers) : undefined,
    body: sanitizeBody(body),
  }

  const message = `HTTP ${status} ${method?.toUpperCase()} ${url} (${durationMs}ms)`

  if (status >= 500) {
    httpLogger.error(payload, message)
  } else if (status >= 400) {
    httpLogger.warn(payload, message)
  } else {
    httpLogger.info(payload, message)
  }
}

export function logHttpError({ method, url, durationMs, err, requestId }) {
  httpLogger.error(
    {
      event: 'http.error',
      requestId,
      method: method?.toUpperCase(),
      url,
      durationMs,
      err: serializeError(err),
    },
    `HTTP ${method?.toUpperCase()} ${url} failed`
  )
}

export function logStorageRequest(operation, key, meta = {}) {
  httpLogger.debug(
    { event: 'storage.request', operation, key, ...meta },
    `Storage ${operation} ${key}`
  )
}

export function logStorageResponse(operation, key, success, meta = {}) {
  const payload = { event: 'storage.response', operation, key, success, ...meta }
  if (success) {
    httpLogger.debug(payload, `Storage ${operation} ${key} succeeded`)
  } else {
    httpLogger.error(payload, `Storage ${operation} ${key} failed`)
  }
}

function sanitizeHeaders(headers) {
  if (!headers || typeof headers !== 'object') return headers
  const copy = { ...headers }
  for (const key of Object.keys(copy)) {
    if (key.toLowerCase() === 'authorization') {
      copy[key] = '[REDACTED]'
    }
  }
  return copy
}

export default logger
