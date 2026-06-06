import { useError } from '../context/ErrorContext'
import './ErrorToast.css'

function ErrorToast() {
  const { toasts, dismissToast } = useError()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="alert"
        >
          <span className="toast-icon" aria-hidden="true">
            {toast.type === 'error' ? '!' : '✓'}
          </span>
          <p className="toast-message">{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export default ErrorToast
