import { expect } from 'chai'
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../../server/utils/AppError.js'

describe('AppError Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default values', () => {
      const error = new AppError('Test error')
      expect(error.message).to.equal('Test error')
      expect(error.statusCode).to.equal(500)
      expect(error.code).to.equal('INTERNAL_ERROR')
      expect(error.isOperational).to.be.true
      expect(error.name).to.equal('AppError')
    })

    it('should create an AppError with custom statusCode', () => {
      const error = new AppError('Test error', 400)
      expect(error.statusCode).to.equal(400)
    })

    it('should create an AppError with custom code', () => {
      const error = new AppError('Test error', 400, 'CUSTOM_CODE')
      expect(error.code).to.equal('CUSTOM_CODE')
    })

    it('should create an AppError with details', () => {
      const details = { field: 'email' }
      const error = new AppError('Test error', 400, 'CUSTOM_CODE', details)
      expect(error.details).to.deep.equal(details)
    })

    it('should be an instance of Error', () => {
      const error = new AppError('Test error')
      expect(error).to.be.instanceOf(Error)
    })
  })

  describe('ValidationError', () => {
    it('should create a ValidationError with 400 status', () => {
      const error = new ValidationError('Validation failed')
      expect(error.message).to.equal('Validation failed')
      expect(error.statusCode).to.equal(400)
      expect(error.code).to.equal('VALIDATION_ERROR')
      expect(error.name).to.equal('ValidationError')
    })

    it('should include details in ValidationError', () => {
      const details = { fields: ['email', 'password'] }
      const error = new ValidationError('Validation failed', details)
      expect(error.details).to.deep.equal(details)
    })

    it('should be an instance of AppError', () => {
      const error = new ValidationError('Validation failed')
      expect(error).to.be.instanceOf(AppError)
    })
  })

  describe('UnauthorizedError', () => {
    it('should create an UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError('Invalid credentials')
      expect(error.message).to.equal('Invalid credentials')
      expect(error.statusCode).to.equal(401)
      expect(error.code).to.equal('UNAUTHORIZED')
      expect(error.name).to.equal('UnauthorizedError')
    })

    it('should have default message', () => {
      const error = new UnauthorizedError()
      expect(error.message).to.equal('You must be logged in to perform this action.')
    })
  })

  describe('ForbiddenError', () => {
    it('should create a ForbiddenError with 403 status', () => {
      const error = new ForbiddenError('Access denied')
      expect(error.message).to.equal('Access denied')
      expect(error.statusCode).to.equal(403)
      expect(error.code).to.equal('FORBIDDEN')
      expect(error.name).to.equal('ForbiddenError')
    })

    it('should have default message', () => {
      const error = new ForbiddenError()
      expect(error.message).to.equal('You do not have permission to perform this action.')
    })
  })

  describe('NotFoundError', () => {
    it('should create a NotFoundError with 404 status', () => {
      const error = new NotFoundError('Resource not found')
      expect(error.message).to.equal('Resource not found')
      expect(error.statusCode).to.equal(404)
      expect(error.code).to.equal('NOT_FOUND')
      expect(error.name).to.equal('NotFoundError')
    })

    it('should have default message', () => {
      const error = new NotFoundError()
      expect(error.message).to.equal('The requested resource was not found.')
    })
  })

  describe('ConflictError', () => {
    it('should create a ConflictError with 409 status', () => {
      const error = new ConflictError('Resource already exists')
      expect(error.message).to.equal('Resource already exists')
      expect(error.statusCode).to.equal(409)
      expect(error.code).to.equal('CONFLICT')
      expect(error.name).to.equal('ConflictError')
    })

    it('should have default message', () => {
      const error = new ConflictError()
      expect(error.message).to.equal('This resource already exists.')
    })
  })
})
