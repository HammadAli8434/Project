import { AppError } from '../utils/AppError.js'
import { errorLogger as log } from '../utils/logger.js'

function serializeError(err) {
  return {
    name: err.name,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    details: err.details,
  }
}

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404, 'ROUTE_NOT_FOUND'))
}

export function errorHandler(err, req, res, _next) {
  const requestId = req.id
  const statusCode = err.statusCode ?? err.status ?? 500
  const isOperational = err instanceof AppError || err.isOperational

  if (isOperational) {
    log.warn(
      {
        event: 'exception.operational',
        requestId,
        err: serializeError(err),
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id,
      },
      err.message
    )
  } else {
    log.error(
      {
        event: 'exception.unhandled',
        requestId,
        err: serializeError(err),
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id,
      },
      'Unhandled exception'
    )
  }

  const response = {
    success: false,
    error: {
      message: isOperational
        ? err.message
        : 'An unexpected error occurred. Please try again later.',
      code: err.code ?? (isOperational ? 'APP_ERROR' : 'INTERNAL_ERROR'),
      ...(err.details ? { details: err.details } : {}),
      ...(process.env.NODE_ENV === 'development' && !isOperational
        ? { debug: err.message }
        : {}),
    },
    requestId,
  }

  res.status(isOperational ? statusCode : 500).json(response)
}
