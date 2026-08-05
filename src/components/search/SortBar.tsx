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
  const currentLabel = SORT_OPTIONS.find(o => o.value === sort)?.label ?? 'Newest First'

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-2">
        <p className="text-slate-900 font-bold text-lg">{total}</p>
        <p className="text-slate-500 text-sm font-medium">
          {total === 1 ? 'property found' : 'properties found'}
        </p>
      </div>
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs hover:border-slate-300 transition-colors">
        <SlidersHorizontal size={14} className="text-slate-400" />
        <select
          value={sort}
          onChange={e => onChange(e.target.value)}
          className="text-sm font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer appearance-none pr-5"
          aria-label="Sort results"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={13} className="text-slate-400 pointer-events-none -ml-4" />
      </div>
    </div>
  )
}
