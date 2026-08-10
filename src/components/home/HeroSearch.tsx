import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, ChevronDown, Sparkles, TrendingUp, Shield, Navigation, Crosshair, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import LocationSelectorGroup from '../ui/LocationSelectorGroup'
import { useUserLocation } from '../../contexts/LocationContext'


const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as any } } }

export function HeroSearch() {
  const navigate = useNavigate()
  const { detectCurrentLocation, isDetecting, location } = useUserLocation()
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

      <div className="page-container relative z-10 pt-10 pb-12 sm:pt-20 sm:pb-20 flex flex-col items-center justify-center text-center">
        
        <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-4xl mx-auto">

          {/* Hero Headline */}
          <motion.h1 variants={item} className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] sm:leading-[1.05] tracking-tight mb-4 sm:mb-6"
            style={{ fontFamily: 'Outfit,sans-serif' }}>
            🏠 Find Your Perfect PG
          </motion.h1>

          <motion.p variants={item} className="text-sm sm:text-lg text-blue-100/90 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-medium px-2">
            Discover PGs, Hostels &amp; Coliving spaces with real reviews.
          </motion.p>

          {/* Detect Location Button */}
          <motion.div variants={item} className="mb-6 sm:mb-8">
            <button
              type="button"
              onClick={() => detectCurrentLocation()}
              disabled={isDetecting}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all active:scale-95 border border-emerald-400/30"
              style={{ boxShadow: '0 10px 30px rgba(16,185,129,0.35)' }}
            >
              {isDetecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Detecting Location...</span>
                </>
              ) : (
                <>
                  <Crosshair size={18} className="animate-pulse" />
                  <span>🎯 Detect My Location</span>
                </>
              )}
            </button>
            {location.cityName && (
              <p className="text-xs text-emerald-300 font-semibold mt-2">
                📍 Currently showing near: <strong className="text-white">{location.cityName}</strong>
              </p>
            )}
          </motion.div>

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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Gender</p>
                      <select
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-slate-900 appearance-none cursor-pointer pr-6"
                      >
                        <option value="">Gender ▼</option>
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
                      Available Only
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
                      🔵 Search PG
                    </button>
                  </div>
                </div>
              </form>
            </div>
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

