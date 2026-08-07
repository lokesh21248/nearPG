import { useState } from 'react'
import { Filter, X, ChevronDown, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchParams } from '../../services/listings.service'

const GENDER_OPTS    = ['Men', 'Women', 'Coliving']
const SHARING_OPTS   = ['Single Sharing', '2 Sharing', '3 Sharing', '4 Sharing', '5 Sharing', '6 Sharing']
const AMENITIES_OPTS = ['WiFi', 'AC', 'Parking', 'Food Included', 'Laundry', 'Gym', 'TV', 'Power Backup', 'Attached Bathroom']

interface Props { filters: SearchParams; onChange: (f: SearchParams) => void }

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-slate-100 pb-5 mb-5 last:border-0 last:mb-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-3"
      >
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChipButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        selected
          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
      }`}
    >
      {selected && <CheckCircle2 size={11} strokeWidth={3} />}
      {label}
    </motion.button>
  )
}

function RadioRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        onClick={onClick}
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 group-hover:border-blue-300'
        }`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className={`text-sm font-medium transition-colors ${selected ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
        {label}
      </span>
    </label>
  )
}

export function SearchFilters({ filters, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  const update = (key: keyof SearchParams, value: unknown) => onChange({ ...filters, [key]: value })

  const toggleArray = (key: 'amenities' | 'sharing', val: string) => {
    const cur = filters[key] || []
    update(key, cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val])
  }

  const EXCLUDED_KEYS = new Set(['state_id', 'city_id', 'area_id', 'sort', 'available_only'])
  const activeCount = Object.keys(filters).filter(k => {
    if (EXCLUDED_KEYS.has(k)) return false
    const val = filters[k as keyof SearchParams]
    if (val === undefined || val === null || val === '') return false
    if (Array.isArray(val)) return val.length > 0
    return true
  }).length + (filters.available_only === 'true' ? 1 : 0)

  const FilterContent = (
    <div className="space-y-0">
      {/* Availability */}
      <div className="border-b border-slate-100 pb-5 mb-5 px-1">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            onClick={() => update('available_only', filters.available_only === 'true' ? undefined : 'true')}
            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
              filters.available_only === 'true' ? 'bg-blue-600 border-blue-600' : 'border-2 border-slate-300 group-hover:border-blue-400'
            }`}
          >
            {filters.available_only === 'true' && <CheckCircle2 size={14} strokeWidth={3} className="text-white" />}
          </div>
          <span className="text-sm font-bold text-slate-800 select-none">
            Show available PGs only
          </span>
        </label>
      </div>

      {/* Gender */}
      <FilterSection title="For">
        <div className="flex flex-wrap gap-2">
          {['Any', ...GENDER_OPTS].map(opt => (
            <ChipButton
              key={opt}
              label={opt}
              selected={opt === 'Any' ? !filters.gender : filters.gender === opt}
              onClick={() => update('gender', opt === 'Any' ? undefined : opt)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Monthly Rent">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Min</p>
            <input
              type="number"
              placeholder="₹ 0"
              value={filters.min_price || ''}
              onChange={e => update('min_price', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
          </div>
          <div className="text-slate-300 font-bold mt-5">–</div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">Max</p>
            <input
              type="number"
              placeholder="₹ ∞"
              value={filters.max_price || ''}
              onChange={e => update('max_price', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            />
          </div>
        </div>
      </FilterSection>

      {/* Room Type */}
      <FilterSection title="Room Type">
        <div className="flex gap-2 flex-wrap">
          {['Any', 'AC', 'Non AC'].map(opt => (
            <ChipButton
              key={opt}
              label={opt}
              selected={opt === 'Any' ? !filters.ac : filters.ac === opt}
              onClick={() => update('ac', opt === 'Any' ? undefined : opt)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Sharing Type */}
      <FilterSection title="Sharing Type" defaultOpen={false}>
        <div className="flex flex-col gap-2">
          {SHARING_OPTS.map(opt => (
            <RadioRow
              key={opt}
              label={opt}
              selected={(filters.sharing || []).includes(opt)}
              onClick={() => toggleArray('sharing', opt)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Amenities */}
      <FilterSection title="Amenities" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_OPTS.map(opt => (
            <ChipButton
              key={opt}
              label={opt}
              selected={(filters.amenities || []).includes(opt)}
              onClick={() => toggleArray('amenities', opt)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* ── Mobile Filter Button ── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full mb-4 flex items-center justify-center gap-2.5 px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition-all"
      >
        <Filter size={16} className="text-white" />
        <span>Filter &amp; Refine</span>
        {activeCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-white text-blue-700 text-xs font-black flex items-center justify-center shadow-xs">
            {activeCount}
          </span>
        )}
      </motion.button>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:block w-72 shrink-0 h-fit sticky top-24">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-blue-600" />
              <h3 className="font-black text-slate-900">Filters</h3>
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={() => onChange({})}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>
          <div className="p-5">{FilterContent}</div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-[60] lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-black text-slate-900">Filters</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{FilterContent}</div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => { onChange({}); setIsOpen(false) }}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-3 btn-primary text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
