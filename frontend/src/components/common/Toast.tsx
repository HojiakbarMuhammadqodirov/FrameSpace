import { CheckCircle, XCircle, Info, X, type Icon } from '@phosphor-icons/react'
import type { Toast, ToastVariant } from '../../hooks/useToast'

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ICONS: Record<ToastVariant, Icon> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
}

const STYLES: Record<ToastVariant, string> = {
  success: 'bg-surface-raised border-green-200 text-green-700',
  error:   'bg-surface-raised border-red-200 text-red-600',
  info:    'bg-surface-raised border-brand-grey text-brand-dark',
}

const ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-green-500',
  error:   'text-red-500',
  info:    'text-brand-brown',
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = ICONS[toast.variant]

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-float text-sm font-medium transition-all ease-spring duration-300 animate-slide-up ${STYLES[toast.variant]}`}>
      <Icon size={16} weight="regular" className={ICON_STYLES[toast.variant]} />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity ease-spring duration-150"
      >
        <X size={14} weight="regular" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-[9000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
