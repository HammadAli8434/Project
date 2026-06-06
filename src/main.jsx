import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { ErrorProvider } from './context/ErrorContext'
import ErrorBoundary from './components/ErrorBoundary'
import ErrorToast from './components/ErrorToast'
import GlobalErrorSetup from './components/GlobalErrorSetup'
import { logEvent } from './utils/logger'
import { setupGlobalErrorHandlers } from './utils/errorHandlers'
import './index.css'
import App from './App.jsx'

setupGlobalErrorHandlers()
logEvent('app.start', { version: import.meta.env.VITE_APP_VERSION ?? '0.0.0' }, 'Application starting')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ErrorProvider>
        <GlobalErrorSetup />
        <ErrorToast />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ErrorProvider>
    </ErrorBoundary>
  </StrictMode>,
)
