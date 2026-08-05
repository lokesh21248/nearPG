import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Navigation, MapPin, SlidersHorizontal, ArrowRight, Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserLocation } from '../../contexts/LocationContext'
import { useSearchListings } from '../../hooks/useListings'
import { calculateDistance, formatDistance } from '../../lib/geo'
import { PGCard } from './PGCard'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'

const RADIUS_OPTIONS = [2, 5, 10, 20, 50]

export function NearbyPGsSection() {
  const { location, setRadius, setIsModalOpen } = useUserLocation()

  // Fetch all available listings for client-side geolocation sorting & filtering
  const { data: listings = [], isLoading } = useSearchListings({ available_only: 'true' })

  // Calculate distance & filter by radius
  const nearbyListings = useMemo(() => {
    if (!listings || listings.length === 0) return []

    // If user has lat/lng, calculate real distance
    if (location.latitude && location.longitude) {
      const userLat = location.latitude
      const userLng = location.longitude

      return listings
        .map((pg: any) => {
          const dist = pg.latitude && pg.longitude
            ? calculateDistance(userLat, userLng, Number(pg.latitude), Number(pg.longitude))
            : Infinity
          return { ...pg, distanceKm: dist }
        })
        .filter((pg) => pg.distanceKm <= (location.radius || 10))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    }

    // If filtered by city name without GPS
    if (location.cityName) {
      return listings.filter(
        (pg) =>
          pg.city?.toLowerCase().includes(location.cityName.toLowerCase()) ||
          location.cityName.toLowerCase().includes(pg.city?.toLowerCase())
      )
    }

    return listings
  }, [listings, location.latitude, location.longitude, location.cityName, location.radius])

  const hasLocation = Boolean(location.latitude || location.cityName)

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-blue-50/50 to-slate-50 border-y border-blue-100/60">
      <div className="page-container">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Navigation size={12} className="text-blue-600" />
              Geolocation Discovery
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
              PGs Near You
            </h2>
            <p className="text-xs sm:text-base text-slate-500 font-medium mt-1">
              {location.cityName ? (
                <span>Showing stays near <strong className="text-slate-800">{location.cityName}</strong></span>
              ) : (
                <span>Auto-sorted by proximity to your detected coordinates</span>
              )}
            </p>
          </div>

          {/* Controls: Radius & Change Location */}
          <div className="flex items-center gap-3 flex-wrap">
            {location.latitude && location.longitude && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                <SlidersHorizontal size={14} className="text-slate-400" />
                <span>Radius:</span>
                <select
                  value={location.radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="bg-transparent border-none outline-none font-bold text-blue-600 cursor-pointer"
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

        {/* Listings content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} variant="card" />
            ))}
          </div>
        ) : nearbyListings.length === 0 ? (
          <div className="bg-white border border-dashed border-blue-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <Compass size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Nearby PGs Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find available properties within {location.radius} km of your selected location. Try expanding your search radius or choose another city.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {location.radius < 50 && (
                <button
                  onClick={() => setRadius(50)}
                  className="px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs sm:text-sm hover:bg-blue-100 transition-colors"
                >
                  Expand Radius to 50 km
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary text-xs sm:text-sm px-5 py-2.5"
              >
                Change Location
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyListings.map((pg) => {
              const formattedDist = pg.distanceKm && pg.distanceKm !== Infinity
                ? formatDistance(pg.distanceKm)
                : null

              return (
                <div key={pg.id} className="relative group">
                  {/* Distance badge overlay if GPS calculated */}
                  {formattedDist && (
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Navigation size={11} className="text-emerald-400" />
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
    </section>
  )
}
