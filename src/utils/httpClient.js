import {
  logHttpRequest,
  logHttpResponse,
  logHttpError,
  logError,
} from './logger'
import { AppError, normalizeError } from './errors'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function buildUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE}${path}`
}

function createRequestId() {
  return crypto.randomUUID()
}

async function parseResponseBody(response) {
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      return await response.json()
    } catch {
      return null
    }
  }
  const text = await response.text()
  return text || null
}

export async function httpClient(url, options = {}) {
  const requestId = createRequestId()
  const method = options.method ?? 'GET'
  const fullUrl = buildUrl(url)
  const start = performance.now()

  const headers = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
    ...options.headers,
  }

  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    body = JSON.stringify(body)
  }

  logHttpRequest({
    requestId,
    method,
    url: fullUrl,
    headers,
    body: options.body,
  })

  try {
    const response = await fetch(fullUrl, {
      ...options,
      method,
      headers,
      body,
    })

    const durationMs = Math.round(performance.now() - start)
    const responseBody = await parseResponseBody(response)
    const responseHeaders = Object.fromEntries(response.headers.entries())

    logHttpResponse({
      requestId,
      method,
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      durationMs,
      headers: responseHeaders,
      body: responseBody,
      ok: response.ok,
    })

    if (!response.ok) {
      const apiMessage = responseBody?.error?.message
      const apiCode = responseBody?.error?.code ?? 'INTERNAL_ERROR'
      const error = new AppError(
        apiMessage ?? response.statusText ?? `Request failed with status ${response.status}`,
        apiCode,
        response.status,
        responseBody?.error?.details
      )
      error.body = responseBody
      error.requestId = responseBody?.requestId ?? requestId
      throw error
    }

    return {
      data: responseBody,
      status: response.status,
      headers: responseHeaders,
      requestId,
    }
  } catch (err) {
    const durationMs = Math.round(performance.now() - start)

    if (err instanceof AppError) {
      logHttpError({ requestId, method, url: fullUrl, durationMs, err })
      throw err
    }

    logHttpError({ requestId, method, url: fullUrl, durationMs, err })

    if (err.name === 'TypeError') {
      const networkError = new AppError(
        'Unable to connect to the server. Please check your connection.',
        'NETWORK_ERROR',
        0
      )
      logError(networkError, { requestId, url: fullUrl }, 'Network request failed')
      throw networkError
    }

    throw normalizeError(err)
  }
}

export const http = {
  get: (url, options) => httpClient(url, { ...options, method: 'GET' }),
  post: (url, body, options) => httpClient(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => httpClient(url, { ...options, method: 'PUT', body }),
  patch: (url, body, options) => httpClient(url, { ...options, method: 'PATCH', body }),
  delete: (url, options) => httpClient(url, { ...options, method: 'DELETE' }),
}

export default httpClient
