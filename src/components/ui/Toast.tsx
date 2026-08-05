import { useState, useEffect, createContext, useContext } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType; id: number } | null>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, id: Date.now() })
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 slide-up">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-rose-600" />}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg ml-2">
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
