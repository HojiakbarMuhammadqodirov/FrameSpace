import { createContext, useContext, type ReactNode } from 'react'
import { useToast, type ToastVariant } from './useToast'
import ToastContainer from '../components/common/Toast'

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => string
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, dismiss } = useToast()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useAppToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useAppToast must be used within ToastProvider')
  return ctx.toast
}
