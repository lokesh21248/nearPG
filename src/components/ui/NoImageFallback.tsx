import { Home } from 'lucide-react'

interface NoImageFallbackProps {
  className?: string
  iconSize?: number
}

export function NoImageFallback({ className = '', iconSize = 48 }: NoImageFallbackProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
      <Home size={iconSize} strokeWidth={1.5} />
      <span className="text-xs font-medium mt-2">No Image</span>
    </div>
  )
}
