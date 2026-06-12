import { useState, useCallback } from 'react'

let toastId = 0

export default function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showSuccess = useCallback((message) => {
    addToast(message, 'success')
  }, [addToast])

  const showError = useCallback((message) => {
    addToast(message, 'error')
  }, [addToast])

  const showWarning = useCallback((message) => {
    addToast(message, 'warning')
  }, [addToast])

  return {
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
  }
}