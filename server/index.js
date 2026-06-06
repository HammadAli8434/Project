import app from './app.js'
import { appLogger as log } from './utils/logger.js'

const PORT = process.env.PORT ?? 3001

const server = app.listen(PORT, () => {
  log.info(
    {
      event: 'server.started',
      port: PORT,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV ?? 'development',
    },
    `Notes API server listening on port ${PORT}`
  )
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log.info({ event: 'server.shutdown' }, 'SIGTERM signal received: closing HTTP server')
  server.close(() => {
    log.info({ event: 'server.closed' }, 'HTTP server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  log.info({ event: 'server.shutdown' }, 'SIGINT signal received: closing HTTP server')
  server.close(() => {
    log.info({ event: 'server.closed' }, 'HTTP server closed')
    process.exit(0)
  })
})

process.on('uncaughtException', (error) => {
  log.error(
    {
      event: 'process.uncaughtException',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    },
    'Uncaught exception'
  )
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error(
    {
      event: 'process.unhandledRejection',
      promise: String(promise),
      reason: String(reason),
    },
    'Unhandled promise rejection'
  )
})
