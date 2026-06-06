import { UnauthorizedError } from '../utils/AppError.js'
import { middlewareLogger as log } from '../utils/logger.js'

export function requireAuth(req, _res, next) {
  const userId = req.headers['x-user-id']
  const userEmail = req.headers['x-user-email']
  const userName = req.headers['x-user-name']

  if (!userId) {
    log.warn(
      {
        event: 'auth.missing',
        requestId: req.id,
        method: req.method,
        url: req.originalUrl,
      },
      'Authentication required but no user ID provided'
    )
    return next(new UnauthorizedError('Authentication required. Please log in.'))
  }

  req.user = {
    id: userId,
    email: userEmail ?? '',
    name: userName ?? 'User',
  }

  log.debug(
    {
      event: 'auth.success',
      requestId: req.id,
      userId: req.user.id,
      method: req.method,
      url: req.originalUrl,
    },
    'User authenticated'
  )

  next()
}
