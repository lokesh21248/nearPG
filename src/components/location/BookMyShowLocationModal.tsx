import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Crosshair, X, ChevronRight, ChevronDown, Map,
  Building2, Sparkles, Clock, Trash2, AlertCircle, Check
} from 'lucide-react'
import { useUserLocation, RecentSearchItem } from '../../contexts/LocationContext'
import { locationService, PopularCity, StateWithCities, LocationSearchResult } from '../../services/location.service'
import { useDebounce } from '../../hooks/useDebounce'

// Text Highlighting Helper
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-200 text-amber-950 font-bold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  )
}

export function BookMyShowLocationModal() {
  const {
    location,
    isModalOpen,
    setIsModalOpen,
    selectLocation,
    detectCurrentLocation,
    isDetecting,
    detectionError,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
  } = useUserLocation()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const [popularCities, setPopularCities] = useState<PopularCity[]>([])
  const [statesWithCities, setStatesWithCities] = useState<StateWithCities[]>([])
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([])

  const [isLoadingPopular, setIsLoadingPopular] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({})
  const [showAllStates, setShowAllStates] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1. Fetch Popular Cities & States with Cities on Mount / Open
  useEffect(() => {
    if (!isModalOpen) return

    let isMounted = true
    setIsLoadingPopular(true)

    Promise.all([
      locationService.getPopularCities(),
      locationService.getStatesWithCities(),
    ]).then(([cities, states]) => {
      if (isMounted) {
        setPopularCities(cities)
        setStatesWithCities(states)
        setIsLoadingPopular(false)
      }
    }).catch(err => {
      console.error('Failed to load modal location data:', err)
      if (isMounted) setIsLoadingPopular(false)
    })

    return () => { isMounted = false }
  }, [isModalOpen])

  // Focus search input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150)
    } else {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [isModalOpen])

  // ESC Key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, setIsModalOpen])

  // 2. Debounced Search Execution
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    locationService.searchLocations(debouncedQuery)
      .then((res) => setSearchResults(res))
      .catch((e) => console.error('Search error:', e))
      .finally(() => setIsSearching(false))
  }, [debouncedQuery])

  // Toggle state expansion in Browse by State
  const toggleStateExpand = (stateId: string) => {
    setExpandedStates(prev => ({ ...prev, [stateId]: !prev[stateId] }))
  }

  // Handle Selection
  const handleSelectCity = (city: PopularCity) => {
    selectLocation({
      stateId: city.stateId || '',
      cityId: city.id,
      stateName: city.stateName || 'State',
      cityName: city.name,
      source: 'manual',
    })
  }

  const handleSelectSearchResult = (res: LocationSearchResult) => {
    selectLocation({
      stateId: res.stateId,
      cityId: res.cityId,
      areaId: res.areaId,
      stateName: res.stateName,
      cityName: res.cityName,
      areaName: res.areaName,
      source: 'manual',
    })
  }

  const handleSelectRecent = (recent: RecentSearchItem) => {
    selectLocation({
      stateId: recent.stateId,
      cityId: recent.cityId,
      areaId: recent.areaId,
      stateName: recent.stateName,
      cityName: recent.cityName,
      areaName: recent.areaName,
      source: 'manual',
    })
  }

  // Visible States limit
  const visibleStates = useMemo(() => {
    if (showAllStates) return statesWithCities
    return statesWithCities.slice(0, 5)
  }, [statesWithCities, showAllStates])

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal Container: Desktop Centered Modal / Mobile 90vh Bottom Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.96 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90vh] sm:max-h-[85vh] border border-slate-100"
          style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)' }}
        >

          {/* Mobile Drag Handle Bar */}
          <div className="sm:hidden flex items-center justify-center pt-3 pb-1">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
          </div>

          {/* ── Modal Header ── */}
          <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
                <MapPin size={12} />
                Location Selector
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
                Choose Your Location
              </h2>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Sticky Search & Detect Location Section ── */}
          <div className="px-5 py-4 sm:px-8 bg-slate-50/80 border-b border-slate-100 space-y-3 sticky top-[73px] z-20 backdrop-blur-md">
            
            {/* Search Input */}
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search State, City, Area, Landmark..."
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 focus:border-blue-500 rounded-2xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Detect My Location Trigger */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => detectCurrentLocation()}
                disabled={isDetecting}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isDetecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Detecting Your GPS Location...</span>
                  </>
                ) : (
                  <>
                    <Crosshair size={16} className="text-emerald-300 animate-pulse" />
                    <span>🎯 Detect My Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Banner */}
            {detectionError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                <AlertCircle size={15} className="shrink-0 text-rose-500" />
                <span>{detectionError}</span>
              </div>
            )}
          </div>

          {/* ── Scrollable Modal Body ── */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-8 custom-scrollbar">

            {/* ── 1. Live Search Results (If query exists) ── */}
            {searchQuery.trim() !== '' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Search Results</span>
                  {isSearching && <span className="text-blue-600 animate-pulse">Searching...</span>}
                </h3>

                {isSearching ? (
                  <div className="space-y-2 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-700">No matching locations found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for another city, area, or state</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                    {searchResults.map((res) => (
                      <button
                        key={`${res.type}-${res.id}`}
                        onClick={() => handleSelectSearchResult(res)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-50/60 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            res.type === 'city' ? 'bg-blue-100 text-blue-700' :
                            res.type === 'area' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {res.type === 'city' ? '🏙️' : res.type === 'area' ? '📍' : '🏛️'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              <HighlightText text={res.title} query={searchQuery} />
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <HighlightText text={res.subtitle} query={searchQuery} />
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          Select <ChevronRight size={14} />
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>

                {/* ── 2. Recent Searches Section ── */}
                {recentSearches.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</h3>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Clear
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {recentSearches.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleSelectRecent(r)}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-800 hover:text-blue-700 text-xs font-bold transition-all shadow-2xs group"
                        >
                          <span>📍 {r.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeRecentSearch(r.id)
                            }}
                            className="text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── 3. Popular Cities Section ── */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Popular Cities</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Sorted by Available PGs</span>
                  </div>

                  {isLoadingPopular ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {popularCities.map((city) => {
                        const isSelected = location.cityName?.toLowerCase() === city.name.toLowerCase()
                        return (
                          <motion.button
                            key={city.id}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelectCity(city)}
                            className={`p-3.5 sm:p-4 rounded-2xl border text-left flex items-center gap-3 transition-all relative overflow-hidden ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                              <Building2 size={24} className="text-slate-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 text-sm truncate leading-tight">{city.name}</p>
                              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">{city.pgCount}+ PGs</p>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── 4. Browse by State Section ── */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Browse by State</h3>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {visibleStates.map((state) => {
                      const isExpanded = Boolean(expandedStates[state.id])
                      return (
                        <div key={state.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                          <button
                            onClick={() => toggleStateExpand(state.id)}
                            className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
                          >
                            <span className="flex items-center gap-2">
                              <Map size={16} className="text-slate-400" />
                              <span>{state.name}</span>
                              <span className="text-xs text-slate-400 font-normal">({state.cities?.length || 0} Cities)</span>
                            </span>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                          </button>

                          {/* Expanded Cities List */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-slate-50/60 border-t border-slate-100 p-3 grid grid-cols-2 sm:grid-cols-3 gap-2"
                              >
                                {state.cities && state.cities.length > 0 ? (
                                  state.cities.map((city) => (
                                    <button
                                      key={city.id}
                                      onClick={() =>
                                        selectLocation({
                                          stateId: state.id,
                                          cityId: city.id,
                                          stateName: state.name,
                                          cityName: city.name,
                                          source: 'manual',
                                        })
                                      }
                                      className="p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold text-left transition-all truncate"
                                    >
                                      📍 {city.name}
                                    </button>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 p-2 col-span-3">No cities listed in this state yet.</p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>

                  {statesWithCities.length > 5 && (
                    <button
                      onClick={() => setShowAllStates(!showAllStates)}
                      className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    >
                      {showAllStates ? 'Collapse States List' : `View All (${statesWithCities.length}) States`}
                    </button>
                  )}
                </div>

              </>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="px-5 py-3.5 sm:px-8 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Currently selected: <strong className="text-slate-900">{location.cityName || location.stateName || 'None'}</strong></span>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
