import express from 'express'
import cors from 'cors'
import pinoHttp from 'pino-http'
import { randomUUID } from 'crypto'
import logger, { appLogger as log } from './utils/logger.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import notesRoutes from './routes/notes.js'

const app = express()

log.info(
  {
    event: 'app.init',
    nodeEnv: process.env.NODE_ENV ?? 'development',
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  'Initializing application'
)

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = req.headers['x-request-id'] ?? randomUUID()
      res.setHeader('X-Request-Id', id)
      return id
    },
    customLogLevel(req, res, err) {
      if (err || res.statusCode >= 500) return 'error'
      if (res.statusCode >= 400) return 'warn'
      return 'info'
    },
  })
)

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

app.use((req, _res, next) => {
  req.id = req.id ?? randomUUID()
  next()
})

log.debug({ event: 'app.routes' }, 'Registering application routes')

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
