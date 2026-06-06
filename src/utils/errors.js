const USER_MESSAGES = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested item could not be found.',
  CONFLICT: 'This action conflicts with existing data.',
  ROUTE_NOT_FOUND: 'The requested service is unavailable.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Unable to connect. Check your internet connection.',
  STORAGE_ERROR: 'Unable to save data locally. Your browser storage may be full.',
}

export class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.userMessage = getUserFacingMessage({ message, code, statusCode })
  }
}

export function getUserFacingMessage(error) {
  if (!error) return USER_MESSAGES.INTERNAL_ERROR

  if (error.userMessage) return error.userMessage

  const code = error.code ?? error.body?.error?.code
  if (code && USER_MESSAGES[code]) return USER_MESSAGES[code]

  if (error.status === 401 || error.statusCode === 401) return USER_MESSAGES.UNAUTHORIZED
  if (error.status === 403 || error.statusCode === 403) return USER_MESSAGES.FORBIDDEN
  if (error.status === 404 || error.statusCode === 404) return USER_MESSAGES.NOT_FOUND
  if (error.status === 409 || error.statusCode === 409) return USER_MESSAGES.CONFLICT
  if (error.status >= 400 && error.status < 500 && error.message) return error.message
  if (error.statusCode >= 400 && error.statusCode < 500 && error.message) return error.message

  if (error.name === 'TypeError' && error.message?.includes('fetch')) {
    return USER_MESSAGES.NETWORK_ERROR
  }

  if (error.message && !error.message.startsWith('HTTP')) {
    return error.message
  }

  return USER_MESSAGES.INTERNAL_ERROR
}

export function normalizeError(err) {
  if (err instanceof AppError) return err

  const apiError = err?.body?.error
  if (apiError) {
    return new AppError(
      apiError.message ?? USER_MESSAGES.INTERNAL_ERROR,
      apiError.code ?? 'INTERNAL_ERROR',
      err.status ?? 500,
      apiError.details ?? null
    )
  }

  if (err instanceof Error) {
    const normalized = new AppError(err.message, err.code ?? 'INTERNAL_ERROR', err.status ?? err.statusCode ?? 500)
    normalized.stack = err.stack
    normalized.cause = err
    return normalized
  }

  return new AppError(String(err))
}

export { USER_MESSAGES }
