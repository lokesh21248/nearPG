import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navigation, MapPin, SlidersHorizontal, ArrowRight, Compass, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserLocation } from '../../contexts/LocationContext'
import { useSearchListings } from '../../hooks/useListings'
import { calculateDistance, formatDistance } from '../../lib/geo'
import { PGCard } from './PGCard'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'
import { DebugPanel } from '../ui/DebugPanel'
import type { PGLite } from '../../types/pg.types'

const RADIUS_OPTIONS = [5, 10, 25, 50, 100]

export function NearbyPGsSection() {
  const { location, setRadius, setIsModalOpen, isDetecting } = useUserLocation()

  // Fetch ALL listings (no status filter) so the geolocation/fallback pipeline always has data.
  // Status filtering (if needed) can be done client-side after distance calculation.
  const { data: rawListings = [], isLoading, error: queryError } = useSearchListings({})

  // State to track if radius was auto-expanded
  const [autoExpandedRadius, setAutoExpandedRadius] = useState<number | null>(null)

  // Calculate distance for every PG & perform auto-expansion / fallback
  const { calculatedListings, finalFilteredListings, isFallbackMode, fallbackReason } = useMemo(() => {
    // ── Diagnostic pipeline trace ──────────────────────────────────────────
    console.group('[NearbyPGsSection] Pipeline trace')
    console.log('1. Supabase raw rows:', rawListings.length, rawListings)
    console.log('2. User location state:', {
      lat: location.latitude, lng: location.longitude,
      city: location.cityName, state: location.stateName,
      radius: location.radius, type: location.detectionType
    })
    // ──────────────────────────────────────────────────────────────────────

    if (!rawListings || rawListings.length === 0) {
      console.warn('[NearbyPGsSection] No rows from Supabase — check RLS policies or database content')
      console.groupEnd()
      return { calculatedListings: [], finalFilteredListings: [], isFallbackMode: false, fallbackReason: '' }
    }

    const userLat = location.latitude
    const userLng = location.longitude
    const currentRadius = location.radius || 10

    // 1. Calculate distance for every single PG
    const withDistance = rawListings.map((pg: PGLite) => {
      let dist = Infinity
      if (userLat != null && userLng != null && pg.latitude != null && pg.longitude != null) {
        dist = calculateDistance(userLat, userLng, Number(pg.latitude), Number(pg.longitude))
      }
      return {
        ...pg,
        distanceKm: dist,
      }
    })

    // Log distance calculations in console as required
    withDistance.forEach((pg) => {
      const inside = pg.distanceKm <= currentRadius
      console.log(`[GeoDiscovery] PG: "${pg.name}" | Dist: ${pg.distanceKm === Infinity ? 'N/A' : pg.distanceKm.toFixed(2) + ' km'} | Inside ${currentRadius}km? ${inside ? 'YES' : 'NO'}`)
    })

    // Sort all by distance ascending if GPS available
    if (userLat != null && userLng != null) {
      withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    }

    // 2. Filter by current radius
    let insideRadiusListings = withDistance.filter((pg) => pg.distanceKm <= currentRadius)

    // 3. Auto-radius expansion if 0 results within selected radius
    let activeRadius = currentRadius
    if (userLat != null && userLng != null && insideRadiusListings.length === 0) {
      for (const rad of [25, 50, 100]) {
        if (rad > currentRadius) {
          const expanded = withDistance.filter((pg) => pg.distanceKm <= rad)
          if (expanded.length > 0) {
            insideRadiusListings = expanded
            activeRadius = rad
            break
          }
        }
      }
    }

    // Update state if auto-expanded
    if (activeRadius !== currentRadius && insideRadiusListings.length > 0) {
      setAutoExpandedRadius(activeRadius)
    } else {
      setAutoExpandedRadius(null)
    }

    // 4. If still no results or user has no GPS: Fallback Priority Logic
    // Priority: Nearby PGs -> Featured PGs -> City Matched -> All Available PGs
    if (insideRadiusListings.length > 0) {
      console.log(`3. Showing ${insideRadiusListings.length} PGs inside ${activeRadius}km radius`)
      console.groupEnd()
      return {
        calculatedListings: withDistance,
        finalFilteredListings: insideRadiusListings,
        isFallbackMode: false,
        fallbackReason: '',
      }
    }

    // Fallback A: Filter by city name match
    if (location.cityName) {
      const cityName = location.cityName.toLowerCase()
      const cityMatched = withDistance.filter(
        (pg) =>
          pg.city?.toLowerCase().includes(cityName) ||
          cityName.includes(pg.city?.toLowerCase() ?? '')
      )
      if (cityMatched.length > 0) {
        console.log(`3. Fallback A: Showing ${cityMatched.length} city-matched PGs for "${location.cityName}"`)
        console.groupEnd()
        return {
          calculatedListings: withDistance,
          finalFilteredListings: cityMatched,
          isFallbackMode: true,
          fallbackReason: `Showing PGs in ${location.cityName}`,
        }
      }
    }

    // Fallback B: Featured PGs
    const featured = withDistance.filter((pg) => pg.featured)
    if (featured.length > 0) {
      console.log(`3. Fallback B: Showing ${featured.length} featured PGs`)
      console.groupEnd()
      return {
        calculatedListings: withDistance,
        finalFilteredListings: featured,
        isFallbackMode: true,
        fallbackReason: `No PGs within ${activeRadius}km. Showing top Featured PGs`,
      }
    }

    // Fallback C: All PGs (final safety net — always shows something if DB has data)
    console.log(`3. Fallback C: Showing all ${withDistance.length} PGs`)
    console.groupEnd()
    return {
      calculatedListings: withDistance,
      finalFilteredListings: withDistance,
      isFallbackMode: true,
      fallbackReason: `Showing top recommended PGs across all locations`,
    }
  }, [rawListings, location.latitude, location.longitude, location.cityName, location.radius])

  const hasLocation = Boolean(location.latitude || location.cityName)

  // Map debug objects for DebugPanel
  const debugCalculatedRows = useMemo(() => {
    return calculatedListings.map(pg => ({
      ...pg,
      insideRadius: pg.distanceKm !== undefined && pg.distanceKm <= (location.radius || 10)
    }))
  }, [calculatedListings, location.radius])

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-blue-50/50 via-slate-50 to-white border-y border-blue-100/60 relative">
      <div className="page-container">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Navigation size={12} className="text-blue-600 animate-pulse" />
              Geolocation Discovery
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
              🔥 Popular Near You
            </h2>
            <p className="text-xs sm:text-base text-slate-500 font-medium mt-1">
              {isFallbackMode ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-500 shrink-0" />
                  {fallbackReason}
                </span>
              ) : autoExpandedRadius ? (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-blue-600 shrink-0" />
                  Auto-expanded search radius to {autoExpandedRadius} km to show nearest PGs
                </span>
              ) : location.cityName ? (
                <span>Showing stays near <strong className="text-slate-800">{location.cityName}</strong></span>
              ) : (
                <span>Auto-sorted by proximity to your detected coordinates</span>
              )}
            </p>
          </div>

          {/* Controls: Radius & Change Location */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {location.latitude && location.longitude && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:border-blue-300 transition-all">
                <SlidersHorizontal size={14} className="text-blue-600" />
                <span>Radius:</span>
                <select
                  value={location.radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value))
                    setAutoExpandedRadius(null)
                  }}
                  className="bg-transparent border-none outline-none font-extrabold text-blue-600 cursor-pointer"
                >
                  {RADIUS_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r} km
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all shadow-xs"
            >
              <MapPin size={13} className="text-blue-600" />
              {hasLocation ? 'Change Location' : '📍 Select Location'}
            </button>
          </div>
        </div>

        {/* Dynamic Loading Status Bar */}
        {(isLoading || isDetecting) && (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50/80 border border-blue-200/60 flex items-center justify-center gap-3 text-blue-900 text-xs sm:text-sm font-semibold animate-pulse">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>
              {isDetecting
                ? 'Getting your location & coordinates...'
                : 'Searching nearby PGs & calculating distances...'}
            </span>
          </div>
        )}

        {/* Listings content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : finalFilteredListings.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
              <Compass size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {queryError ? '⚠️ Database Error' : 'No PGs in Database Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              {queryError
                ? `Could not load PG listings: ${(queryError as Error).message}. Check Supabase RLS policies or network connection.`
                : 'No PG listings found in the database. Add properties via the Admin page to see them here.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary text-xs sm:text-sm px-5 py-2.5"
              >
                Select Another Location
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary text-xs sm:text-sm px-5 py-2.5"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {finalFilteredListings.map((pg) => {
              const formattedDist = pg.distanceKm && pg.distanceKm !== Infinity
                ? formatDistance(pg.distanceKm)
                : null

              return (
                <div key={pg.id} className="relative group">
                  {/* Distance badge overlay if GPS calculated */}
                  {formattedDist && (
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Navigation size={11} className="text-emerald-400 animate-pulse" />
                      <span>{formattedDist} away</span>
                    </div>
                  )}

                  <PGCard pg={pg} />
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/map"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Open Interactive Map View</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Debug Panel Component (?debug=true) */}
      <DebugPanel
        totalSupabaseRows={rawListings.length}
        filteredRows={finalFilteredListings}
        allCalculatedRows={debugCalculatedRows}
        errorMessage={queryError ? (queryError as Error).message : null}
      />
    </section>
  )
}
