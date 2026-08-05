import { Star } from 'lucide-react'

export function StarRating({ rating, className = '', readOnly = true, onChange }: { rating: number, className?: string, readOnly?: boolean, onChange?: (r: number) => void }) {
  const r = Math.round(Number(rating) || 0)
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          onClick={() => !readOnly && onChange?.(star)}
          className={`${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${
            star <= r ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
          }`}
        />
      ))}
    </div>
  )
}
