import { expect } from 'chai'
import { asyncHandler } from '../../../server/utils/asyncHandler.js'

describe('asyncHandler', () => {
  it('should wrap a function and return a middleware function', () => {
    const fn = async (req, res, next) => {
      res.json({ success: true })
    }
    const wrapped = asyncHandler(fn)
    expect(wrapped).to.be.a('function')
    expect(wrapped.length).to.equal(3)
  })

  it('should call the wrapped function with req, res, next', (done) => {
    const fn = async (req, res, next) => {
      expect(req).to.deep.equal({ test: true })
      expect(res).to.deep.equal({ json: () => {} })
      done()
    }
    const wrapped = asyncHandler(fn)
    wrapped({ test: true }, { json: () => {} }, () => {})
  })

  it('should catch errors and pass them to next', (done) => {
    const testError = new Error('Test error')
    const fn = async (_req, _res, _next) => {
      throw testError
    }
    const wrapped = asyncHandler(fn)
    const nextFn = (err) => {
      expect(err).to.equal(testError)
      done()
    }
    wrapped({}, {}, nextFn)
  })

  it('should handle promises that reject', (done) => {
    const testError = new Error('Promise rejection')
    const fn = async (_req, _res, _next) => {
      return Promise.reject(testError)
    }
    const wrapped = asyncHandler(fn)
    const nextFn = (err) => {
      expect(err).to.equal(testError)
      done()
    }
    wrapped({}, {}, nextFn)
  })

  it('should handle successful async operations', (done) => {
    const res = { json: (data) => ({ data }) }
    const fn = async (_req, res, _next) => {
      return res.json({ success: true })
    }
    const wrapped = asyncHandler(fn)
    wrapped({}, res, () => {
      done()
    })
  })
})
