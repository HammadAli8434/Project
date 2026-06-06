import { logError, logEvent } from './logger'
import { getUserFacingMessage, normalizeError } from './errors'

let globalErrorHandler = null

export function registerGlobalErrorHandler(handler) {
  globalErrorHandler = handler
}

export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (event) => {
    const err = normalizeError(event.error ?? event.message)
    logError(err, {
      event: 'global.error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, 'Uncaught global error')

    globalErrorHandler?.(err, { source: 'window.error' })
  })

  window.addEventListener('unhandledrejection', (event) => {
    const err = normalizeError(event.reason)
    logError(err, {
      event: 'global.unhandledrejection',
    }, 'Unhandled promise rejection')

    globalErrorHandler?.(err, { source: 'unhandledrejection' })
    event.preventDefault()
  })

  window.addEventListener('online', () => {
    logEvent('network.online', {}, 'Network connection restored')
  })

  window.addEventListener('offline', () => {
    logEvent('network.offline', {}, 'Network connection lost')
    globalErrorHandler?.(
      { message: 'You are offline. Some features may not work.', code: 'NETWORK_ERROR' },
      { source: 'network.offline' }
    )
  })

  logEvent('error.handlers.initialized', {}, 'Global error handlers registered')
}

export { getUserFacingMessage }
