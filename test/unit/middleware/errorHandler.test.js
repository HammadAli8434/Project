import { expect } from 'chai'
import { notFoundHandler, errorHandler } from '../../../server/middleware/errorHandler.js'
import {
  AppError,
  ValidationError,
  UnauthorizedError,
} from '../../../server/utils/AppError.js'

describe('Error Handler Middleware', () => {
  describe('notFoundHandler', () => {
    it('should call next with AppError for 404', (done) => {
      const req = {
        method: 'GET',
        originalUrl: '/api/unknown',
      }
      const res = {}
      const next = (err) => {
        expect(err).to.be.instanceOf(AppError)
        expect(err.statusCode).to.equal(404)
        expect(err.code).to.equal('ROUTE_NOT_FOUND')
        expect(err.message).to.include('/api/unknown')
        done()
      }

      notFoundHandler(req, res, next)
    })

    it('should include method and URL in error message', (done) => {
      const req = {
        method: 'POST',
        originalUrl: '/api/notes/invalid',
      }
      const res = {}
      const next = (err) => {
        expect(err.message).to.include('POST')
        expect(err.message).to.include('/api/notes/invalid')
        done()
      }

      notFoundHandler(req, res, next)
    })
  })

  describe('errorHandler', () => {
    it('should handle operational errors', (done) => {
      const err = new ValidationError('Test validation error')
      const req = {
        id: 'req-123',
        method: 'POST',
        originalUrl: '/api/notes',
        user: { id: 'user-123' },
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(this.statusCode).to.equal(400)
          expect(data.success).to.be.false
          expect(data.error.code).to.equal('VALIDATION_ERROR')
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })

    it('should return 500 for unhandled errors', (done) => {
      const err = new Error('Unexpected error')
      const req = {
        id: 'req-123',
        method: 'GET',
        originalUrl: '/api/notes',
        user: { id: 'user-123' },
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(this.statusCode).to.equal(500)
          expect(data.success).to.be.false
          expect(data.error.code).to.equal('INTERNAL_ERROR')
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })

    it('should handle errors without user context', (done) => {
      const err = new UnauthorizedError('Authentication required')
      const req = {
        id: 'req-123',
        method: 'POST',
        originalUrl: '/api/notes',
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(this.statusCode).to.equal(401)
          expect(data.success).to.be.false
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })

    it('should return consistent error response format', (done) => {
      const err = new ValidationError('Field required')
      const req = {
        id: 'req-123',
        method: 'POST',
        originalUrl: '/api/notes',
        user: { id: 'user-123' },
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(data).to.have.property('success', false)
          expect(data).to.have.property('error')
          expect(data.error).to.have.property('code')
          expect(data.error).to.have.property('message')
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })

    it('should handle AppError with custom status codes', (done) => {
      const err = new AppError('Conflict occurred', 409, 'CONFLICT')
      const req = {
        id: 'req-123',
        method: 'POST',
        originalUrl: '/api/auth/signup',
        user: { id: 'user-123' },
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(this.statusCode).to.equal(409)
          expect(data.error.code).to.equal('CONFLICT')
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })

    it('should include error details when available', (done) => {
      const details = { field: 'email', reason: 'invalid_format' }
      const err = new ValidationError('Validation failed', details)
      const req = {
        id: 'req-123',
        method: 'POST',
        originalUrl: '/api/auth/signup',
        user: { id: 'user-123' },
      }
      const res = {
        status: function (code) {
          this.statusCode = code
          return this
        },
        json: function (data) {
          expect(data.error.details).to.deep.equal(details)
          done()
        },
      }

      errorHandler(err, req, res, () => {})
    })
  })
})
