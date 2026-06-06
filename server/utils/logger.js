import pino from 'pino'

const isDevelopment = process.env.NODE_ENV !== 'production'

const logger = pino({
  name: 'notes-api',
  level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV ?? 'development',
    version: '1.0.0',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: false,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

export function createLogger(module) {
  return logger.child({ module })
}

export const appLogger = createLogger('app')
export const authLogger = createLogger('auth')
export const notesLogger = createLogger('notes')
export const healthLogger = createLogger('health')
export const errorLogger = createLogger('error')
export const dbLogger = createLogger('database')
export const middlewareLogger = createLogger('middleware')

export default logger
