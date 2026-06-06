import { createContext, useContext, useState, useCallback } from 'react'
import { normalizeError, getUserFacingMessage } from '../utils/errors'
import { logError } from '../utils/logger'

const ErrorContext = createContext(null)

let toastId = 0

export function ErrorProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showError = useCallback((err, context = {}) => {
    const normalized = normalizeError(err)
    const userMessage = getUserFacingMessage(normalized)

    logError(normalized, {
      event: 'ui.error.displayed',
      code: normalized.code,
      statusCode: normalized.statusCode,
      ...context,
    }, userMessage)

    const id = ++toastId
    setToasts((prev) => [...prev, { id, message: userMessage, type: 'error' }])

    setTimeout(() => dismissToast(id), 6000)
    return userMessage
  }, [dismissToast])

  const showSuccess = useCallback((message) => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type: 'success' }])
    setTimeout(() => dismissToast(id), 4000)
  }, [dismissToast])

  const handleError = useCallback((err, context = {}) => {
    return showError(err, context)
  }, [showError])

  return (
    <ErrorContext.Provider
      value={{ toasts, showError, showSuccess, handleError, dismissToast }}
    >
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}
