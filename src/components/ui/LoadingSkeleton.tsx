export function LoadingSkeleton({ className = '', variant = 'card' }: { className?: string, variant?: 'card' | 'text' | 'image' }) {
  if (variant === 'card') {
    return (
      <div className={`pg-card overflow-hidden ${className}`}>
        <div className="skeleton w-full aspect-[4/3]"></div>
        <div className="p-4 space-y-3">
          <div className="skeleton h-5 w-3/4"></div>
          <div className="skeleton h-4 w-1/2"></div>
          <div className="pt-3 border-t border-slate-100 flex justify-between">
            <div className="skeleton h-6 w-1/3"></div>
            <div className="skeleton h-6 w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (variant === 'image') {
    return <div className={`skeleton ${className}`}></div>
  }

  return <div className={`skeleton h-4 ${className}`}></div>
}
