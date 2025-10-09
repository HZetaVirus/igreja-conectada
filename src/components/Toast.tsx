import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: '✓',
      border: 'border-green-600',
    },
    error: {
      bg: 'bg-red-500',
      icon: '✕',
      border: 'border-red-600',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '⚠',
      border: 'border-yellow-600',
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'ℹ',
      border: 'border-blue-600',
    },
  }

  const style = styles[type]

  return (
    <div className="animate-slide-up">
      <div className={`${style.bg} ${style.border} border-l-4 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px] max-w-md`}>
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white bg-opacity-20 rounded-full">
          <span className="text-xl font-bold">{style.icon}</span>
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 text-2xl font-bold leading-none transition-colors"
          aria-label="Fechar"
        >
          ×
        </button>
      </div>
    </div>
  )
}
