import { useState, useCallback } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(ts => ts.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info', duration = 3000) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(ts => [...ts, { id, message, variant }])
    setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  return { toasts, toast, dismiss }
}
