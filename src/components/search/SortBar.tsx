import { ChevronDown, SlidersHorizontal } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

interface SortBarProps {
  total: number
  sort: string
  onChange: (sort: string) => void
}

export function SortBar({ total, sort, onChange }: SortBarProps) {

  return (
    <div className="flex items-center justify-between mb-5 gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-black">
          {total}
        </span>
        <p className="text-slate-600 text-xs sm:text-sm font-extrabold">
          {total === 1 ? 'PG Available' : 'PGs Available'}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl px-3 py-1.5 sm:py-2 shadow-xs transition-all">
        <SlidersHorizontal size={13} className="text-blue-600 shrink-0" />
        <select
          value={sort}
          onChange={e => onChange(e.target.value)}
          className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer appearance-none pr-5"
          aria-label="Sort results"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="text-slate-400 pointer-events-none -ml-4 shrink-0" />
      </div>
    </div>
  )
}
