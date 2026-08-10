import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users, Star, Zap, Wind, MapPin } from 'lucide-react'

const CATEGORIES = [
  { id: 'all',       label: 'All Stays',    icon: '🏠', params: {} },
  { id: 'men',       label: 'Men',          icon: '👨', params: { gender: 'Men' } },
  { id: 'women',     label: 'Women',        icon: '👩', params: { gender: 'Women' } },
  { id: 'coliving',  label: 'Coliving',     icon: '🤝', params: { gender: 'Coliving' } },
  { id: 'featured',  label: 'Top Picks',    icon: '⭐', params: { featured: 'true' } },
  { id: 'ac',        label: 'AC Rooms',     icon: '❄️', params: { ac: 'AC' } },
  { id: 'new',       label: 'Newly Added',  icon: '✨', params: { sort: 'newest' } },
  { id: 'budget',    label: 'Under ₹8,000', icon: '💰', params: { max_price: '8000' } },
]

export function CategoryNav() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const activeCategory = (() => {
    const gender = searchParams.get('gender')
    const featured = searchParams.get('featured')
    const ac = searchParams.get('ac')
    const sort = searchParams.get('sort')
    const maxPrice = searchParams.get('max_price')

    if (gender === 'Men') return 'men'
    if (gender === 'Women') return 'women'
    if (gender === 'Coliving') return 'coliving'
    if (featured === 'true') return 'featured'
    if (ac === 'AC') return 'ac'
    if (sort === 'newest') return 'new'
    if (maxPrice === '8000') return 'budget'
    return 'all'
  })()

  const handleCategory = (cat: typeof CATEGORIES[0]) => {
    const params = new URLSearchParams(cat.params as Record<string, string>)
    if (cat.params && Object.keys(cat.params).length > 0) {
      params.set('available_only', 'true')
    }
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="page-container">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory
            return (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0 border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <span className="text-sm leading-none">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
