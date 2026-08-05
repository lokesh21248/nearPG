import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, ChevronDown, Sparkles, TrendingUp, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import LocationSelectorGroup from '../ui/LocationSelectorGroup'

const STATS = [
  { value: 'Verified', label: 'PG Listings',    icon: '🏠' },
  { value: 'Direct',   label: 'Owner Contact',  icon: '📞' },
  { value: 'Zero',     label: 'Brokerage Fee',  icon: '💰' },
  { value: 'Instant',  label: 'Visit Booking',  icon: '⚡' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as any } } }

export function HeroSearch() {
  const navigate = useNavigate()
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId]   = useState('')
  const [areaId, setAreaId]   = useState('')
  const [gender, setGender]   = useState('')
  const [onlyWithListings, setOnlyWithListings] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!stateId || !cityId || !areaId) {
      setValidationError('Please select State, City, and Area to search.')
      return
    }

    setValidationError('')
    const params = new URLSearchParams()
    params.set('state_id', stateId)
    params.set('city_id', cityId)
    params.set('area_id', areaId)
    if (gender) params.set('gender', gender)
    if (onlyWithListings) params.set('available_only', 'true')
    
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="relative overflow-hidden min-h-fit sm:min-h-[90vh] md:min-h-[95vh]" style={{ background: 'linear-gradient(135deg,#0F1F5C 0%,#1D4ED8 42%,#5B21B6 80%,#3B0764 100%)' }}>

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#60A5FA,transparent)' }} />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#A78BFA,transparent)' }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle,#BFDBFE,transparent)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="page-container relative z-10 pt-10 pb-12 sm:pt-24 sm:pb-20 flex flex-col items-center justify-center text-center">
        
        <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-4xl mx-auto">

          {/* Trust badge */}
          <motion.div variants={item} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-400/30 bg-white/10 backdrop-blur-sm text-blue-200 text-[11px] sm:text-xs font-semibold mb-4 sm:mb-8">
            <Sparkles size={12} className="text-blue-300" />
            India's #1 PG Discovery Platform
            <TrendingUp size={12} className="text-emerald-400" />
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 variants={item} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] sm:leading-[1.05] tracking-tight mb-3 sm:mb-6"
            style={{ fontFamily: 'Outfit,sans-serif' }}>
            Find Your Perfect
            <span className="block" style={{ background: 'linear-gradient(135deg,#93C5FD,#C4B5FD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Home Away
            </span>
            from Home
          </motion.h1>

          <motion.p variants={item} className="text-sm sm:text-xl text-blue-100/90 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-medium px-2">
            Discover verified PGs, Hostels &amp; Coliving spaces with real reviews, zero brokerage, and direct owner contact.
          </motion.p>

          {/* ── Search Box ── */}
          <motion.div variants={item} className="relative text-left w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl max-w-3xl mx-auto border border-slate-100"
              style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.35)' }}>
              <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
                
                {/* Reusable Cascading Dropdowns */}
                <LocationSelectorGroup
                  stateId={stateId}
                  cityId={cityId}
                  areaId={areaId}
                  onStateChange={(id) => { setStateId(id); setValidationError('') }}
                  onCityChange={(id) => { setCityId(id); setValidationError('') }}
                  onAreaChange={(id) => { setAreaId(id); setValidationError('') }}
                  horizontal={true}
                  onlyWithListings={onlyWithListings}
                />

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Gender filter */}
                  <div className="w-full sm:w-60 flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 transition-all">
                    <Users size={16} className="text-slate-400 shrink-0" />
                    <div className="flex-1 relative">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Looking For</p>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-slate-900 appearance-none cursor-pointer pr-6"
                      >
                        <option value="">Any Gender</option>
                        <option value="Men">Men Only</option>
                        <option value="Women">Women Only</option>
                        <option value="Coliving">Coliving</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1 sm:py-0">
                    <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 select-none">
                      <input 
                        type="checkbox" 
                        checked={onlyWithListings}
                        onChange={(e) => setOnlyWithListings(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Show available PGs only
                    </label>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {validationError && (
                      <span className="text-xs text-rose-500 font-semibold px-2 text-center sm:text-right">
                        {validationError}
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={!stateId || !cityId || !areaId}
                      className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 8px 24px rgba(37,99,235,0.40)' }}
                    >
                      <Search size={18} strokeWidth={2.5} />
                      Search PGs
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ── Stats bar ── */}
          <motion.div variants={item} className="mt-8 sm:mt-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl mx-auto">
              {STATS.map(s => (
                <div key={s.label} className="flex flex-col items-center gap-0.5 sm:gap-1 px-3 py-3 sm:px-4 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <span className="text-xl sm:text-2xl leading-none">{s.icon}</span>
                  <span className="text-lg sm:text-2xl font-black text-white mt-1" style={{ fontFamily: 'Outfit,sans-serif' }}>{s.value}</span>
                  <span className="text-blue-200/80 text-[11px] sm:text-xs font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={item} className="mt-6 sm:mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            {[
              { icon: Shield, text: '100% Verified Listings' },
              { icon: Shield, text: 'Zero Brokerage' },
              { icon: Shield, text: 'Free Visit Booking' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-blue-200/70 text-[11px] sm:text-xs font-medium">
                <Icon size={13} className="text-emerald-400 shrink-0" />
                {text}
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64L1440 64L1440 32C1200 64 960 0 720 16C480 32 240 64 0 32L0 64Z" fill="#F8FAFC" />
        </svg>
      </div>
    </div>
  )
}
