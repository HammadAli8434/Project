import { Component } from 'react'
import { logError } from '../utils/logger'
import { getUserFacingMessage } from '../utils/errors'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: getUserFacingMessage(error),
    }
  }

  componentDidCatch(error, errorInfo) {
    logError(error, {
      event: 'react.error_boundary',
      componentStack: errorInfo.componentStack,
    }, 'React component error caught')
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <div className="error-fallback-icon" aria-hidden="true">!</div>
          <h2>Something went wrong</h2>
          <p>{this.state.message ?? 'An unexpected error occurred. Please try again.'}</p>
          <div className="error-fallback-actions">
            <button type="button" className="btn btn-primary" onClick={this.handleRetry}>
              Try Again
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
