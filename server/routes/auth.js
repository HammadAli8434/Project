import { Router } from 'express'
import { createHash, randomUUID } from 'crypto'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ValidationError, ConflictError, UnauthorizedError } from '../utils/AppError.js'
import { createUser, findUserByEmail } from '../store/memoryStore.js'
import { authLogger as log } from '../utils/logger.js'

const router = Router()

function hashPassword(password, email) {
  return createHash('sha256').update(`${email.toLowerCase()}:${password}`).digest('hex')
}

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email }
}

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body ?? {}

    log.debug(
      {
        event: 'auth.signup.attempt',
        requestId: req.id,
        email: email?.trim().toLowerCase(),
      },
      'Signup attempt'
    )

    if (!name?.trim() || !email?.trim() || !password) {
      log.warn(
        {
          event: 'auth.signup.validation_failed',
          requestId: req.id,
          reason: 'missing_fields',
        },
        'Signup validation failed: missing required fields'
      )
      throw new ValidationError('All fields are required.', {
        fields: ['name', 'email', 'password'],
      })
    }

    if (password.length < 6) {
      log.warn(
        {
          event: 'auth.signup.validation_failed',
          requestId: req.id,
          reason: 'weak_password',
        },
        'Signup validation failed: password too weak'
      )
      throw new ValidationError('Password must be at least 6 characters.')
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (findUserByEmail(trimmedEmail)) {
      log.warn(
        {
          event: 'auth.signup.conflict',
          requestId: req.id,
          email: trimmedEmail,
        },
        'Signup failed: email already registered'
      )
      throw new ConflictError('An account with this email already exists.')
    }

    const user = createUser({
      id: randomUUID(),
      name: name.trim(),
      email: trimmedEmail,
      passwordHash: hashPassword(password, trimmedEmail),
      createdAt: Date.now(),
    })

    log.info(
      {
        event: 'auth.signup.success',
        requestId: req.id,
        userId: user.id,
        email: user.email,
      },
      'User registered successfully'
    )

    res.status(201).json({ success: true, data: { user: sanitizeUser(user) } })
  })
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {}

    log.debug(
      {
        event: 'auth.login.attempt',
        requestId: req.id,
        email: email?.trim().toLowerCase(),
      },
      'Login attempt'
    )

    if (!email?.trim() || !password) {
      log.warn(
        {
          event: 'auth.login.validation_failed',
          requestId: req.id,
          reason: 'missing_credentials',
        },
        'Login validation failed: missing email or password'
      )
      throw new ValidationError('Email and password are required.')
    }

    const trimmedEmail = email.trim().toLowerCase()
    const user = findUserByEmail(trimmedEmail)

    if (!user || user.passwordHash !== hashPassword(password, trimmedEmail)) {
      log.warn(
        {
          event: 'auth.login.failed',
          requestId: req.id,
          email: trimmedEmail,
          reason: user ? 'invalid_password' : 'user_not_found',
        },
        'Login failed: invalid credentials'
      )
      throw new UnauthorizedError('Invalid email or password.')
    }

    log.info(
      {
        event: 'auth.login.success',
        requestId: req.id,
        userId: user.id,
        email: user.email,
      },
      'User logged in successfully'
    )

    res.json({ success: true, data: { user: sanitizeUser(user) } })
  })
)

export default router
