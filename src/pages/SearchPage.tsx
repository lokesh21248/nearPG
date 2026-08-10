import { useMemo, useEffect } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SearchFilters } from '../components/search/SearchFilters'
import { SortBar } from '../components/search/SortBar'
import { PGCard } from '../components/home/PGCard'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { SearchX, X, MapPin } from 'lucide-react'
import { useSearchListings } from '../hooks/useListings'
import type { SearchParams } from '../services/listings.service'
import { useUserLocation } from '../contexts/LocationContext'
import { locationService } from '../services/location.service'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { stateSlug, citySlug, areaSlug } = useParams()
  const { location: userLoc, selectLocation, setIsModalOpen } = useUserLocation()

  // Sync route params if present
  useEffect(() => {
    if (stateSlug) {
      locationService.getLocationBySlug(stateSlug, citySlug, areaSlug).then(resolved => {
        if (resolved) {
          selectLocation({
            stateId: resolved.stateId,
            cityId: resolved.cityId,
            areaId: resolved.areaId,
            stateName: resolved.stateName,
            cityName: resolved.cityName,
            areaName: resolved.areaName,
            source: 'url',
          })
        }
      })
    }
  }, [stateSlug, citySlug, areaSlug, selectLocation])

  // Combine URL search params + global location store values
  const filters: SearchParams = useMemo(() => {
    const p: Record<string, unknown> = {}
    searchParams.forEach((val, key) => {
      if (key === 'amenities' || key === 'sharing') p[key] = val.split(',')
      else p[key] = val
    })

    // If not set in query params, fallback to global user location store
    if (!p.state_id && userLoc.stateId) p.state_id = userLoc.stateId
    if (!p.city_id && userLoc.cityId) p.city_id = userLoc.cityId
    if (!p.area_id && userLoc.areaId) p.area_id = userLoc.areaId

    return p as SearchParams
  }, [searchParams, userLoc.stateId, userLoc.cityId, userLoc.areaId])

  const { data: listings, isLoading } = useSearchListings(filters)

  // Location display label
  const locationLabel = userLoc.areaName || userLoc.cityName || userLoc.stateName || 'All Cities'

  // Cascading location states
  const stateId = (filters.state_id as string) || ''
  const cityId = (filters.city_id as string) || ''
  const areaId = (filters.area_id as string) || ''



  const handleFilterChange = (newFilters: SearchParams) => {
    const params = new URLSearchParams()
    
    // Copy existing state_id, city_id, area_id
    if (stateId) params.set('state_id', stateId)
    if (cityId) params.set('city_id', cityId)
    if (areaId) params.set('area_id', areaId)

    Object.entries(newFilters).forEach(([key, val]) => {
      if (key === 'state_id' || key === 'city_id' || key === 'area_id') return
      if (Array.isArray(val)) {
        if (val.length > 0) params.set(key, val.join(','))
      } else if (val) {
        params.set(key, val as string)
      }
    })
    setSearchParams(params)
  }

  const handleSortChange = (sort: string) => handleFilterChange({ ...filters, sort })

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; key: string }[] = []
    if (filters.gender)    chips.push({ label: `For ${filters.gender}`, key: 'gender' })
    if (filters.ac)        chips.push({ label: filters.ac as string,     key: 'ac' })
    if (filters.min_price) chips.push({ label: `Min ₹${filters.min_price}`, key: 'min_price' })
    if (filters.max_price) chips.push({ label: `Max ₹${filters.max_price}`, key: 'max_price' })
    if (filters.available_only === 'true' || filters.available_only === true) chips.push({ label: 'Available Only', key: 'available_only' })
    
    const sharing = filters.sharing as string[] | undefined
    if (sharing?.length)   chips.push({ label: `${sharing.length} Sharing`, key: 'sharing' })
    
    const amen = filters.amenities as string[] | undefined
    if (amen?.length)      chips.push({ label: `${amen.length} Amenities`, key: 'amenities' })
    
    return chips
  }, [filters])

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams())
  }

  return (
    <PageWrapper>
      <Helmet>
        <title>Search PGs &amp; Hostels | NearPG</title>
        <meta name="description" content="Search and filter the best PGs, Hostels, and Coliving spaces matching your preferences." />
      </Helmet>

      {/* ── Top Location Selector Pill ── */}
      <div className="bg-white border-b border-slate-200 py-2.5 sm:py-3.5 sticky top-[108px] md:top-16 z-30 shadow-xs">
        <div className="page-container flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-extrabold text-xs sm:text-sm hover:bg-blue-100 transition-all shadow-xs"
            >
              <MapPin size={14} className="text-blue-600 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-none">📍 {locationLabel}</span>
              <span className="text-[11px] sm:text-xs text-blue-600 font-semibold underline ml-0.5 shrink-0">Change</span>
            </button>
            {userLoc.stateName && (
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                in {userLoc.stateName}
              </span>
            )}
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {activeFilterChips.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => handleFilterChange({ ...filters, [chip.key]: undefined })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] sm:text-xs font-semibold hover:bg-blue-100 transition-colors shrink-0"
                >
                  {chip.label}
                  <X size={11} />
                </button>
              ))}
              <button
                onClick={handleClearAll}
                className="text-[11px] sm:text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 transition-colors shrink-0"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="page-container py-6 sm:py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters */}
        <SearchFilters filters={filters} onChange={handleFilterChange} />

        {/* Results */}
        <div className="flex-1 w-full min-w-0">
          {!isLoading && <SortBar total={listings?.length || 0} sort={(filters.sort as string) || 'newest'} onChange={handleSortChange} />}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <LoadingSkeleton key={i} variant="card" />)}
            </div>
          ) : !listings || listings.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-3xl py-16">
              <EmptyState
                icon={SearchX}
                title="No PGs Found"
                description="We couldn't find properties matching your filters. Try adjusting or clearing your search criteria."
                action={
                  <button
                    onClick={handleClearAll}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                }
              />
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {listings.map((pg, i) => (
                  <motion.div
                    key={pg.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3), duration: 0.35 }}
                  >
                    <PGCard pg={pg} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
