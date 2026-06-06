import { useEffect } from 'react'
import { useError } from '../context/ErrorContext'
import { registerGlobalErrorHandler } from '../utils/errorHandlers'

function GlobalErrorSetup() {
  const { showError } = useError()

  useEffect(() => {
    registerGlobalErrorHandler((err, context) => {
      if (context?.source === 'network.offline') {
        showError(err, context)
      }
    })
  }, [showError])

  return null
}

export default GlobalErrorSetup
