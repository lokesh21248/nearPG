import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import LocationSelectorGroup from '../components/ui/LocationSelectorGroup'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from search params
  const filters: SearchParams = useMemo(() => {
    const p: Record<string, unknown> = {}
    searchParams.forEach((val, key) => {
      if (key === 'amenities' || key === 'sharing') p[key] = val.split(',')
      else p[key] = val
    })
    return p as SearchParams
  }, [searchParams])

  const { data: listings, isLoading } = useSearchListings(filters)

  // Cascading location states
  const stateId = (filters.state_id as string) || ''
  const cityId = (filters.city_id as string) || ''
  const areaId = (filters.area_id as string) || ''

  const handleLocationChange = (key: 'state_id' | 'city_id' | 'area_id', id: string) => {
    setSearchParams(prev => {
      if (id) {
        prev.set(key, id)
      } else {
        prev.delete(key)
      }

      // Clear child values when parent changes
      if (key === 'state_id') {
        prev.delete('city_id')
        prev.delete('area_id')
      } else if (key === 'city_id') {
        prev.delete('area_id')
      }

      return prev
    })
  }

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

      {/* ── Top Cascading Dropdowns Search Bar ── */}
      <div className="bg-white border-b border-slate-200 py-4 sticky top-16 z-30 shadow-sm">
        <div className="page-container">
          <div className="max-w-4xl bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Select Stay Location
            </div>
            
            <LocationSelectorGroup
              stateId={stateId}
              cityId={cityId}
              areaId={areaId}
              onStateChange={(id) => handleLocationChange('state_id', id)}
              onCityChange={(id) => handleLocationChange('city_id', id)}
              onAreaChange={(id) => handleLocationChange('area_id', id)}
              horizontal={true}
              onlyWithListings={filters.available_only === 'true' || filters.available_only === true}
            />
          </div>

          {/* Active filter chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {activeFilterChips.map(chip => (
                <button
                  key={chip.key}
                  onClick={() => handleFilterChange({ ...filters, [chip.key]: undefined })}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  {chip.label}
                  <X size={11} />
                </button>
              ))}
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 px-2 py-1 transition-colors"
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
