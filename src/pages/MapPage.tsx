import { useEffect, useRef, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { MapPin, Navigation, Compass, Phone, ArrowLeft, ExternalLink, ShieldCheck, Sparkles, Star } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useUserLocation } from '../contexts/LocationContext'
import { useSearchListings } from '../hooks/useListings'
import { calculateDistance, formatDistance } from '../lib/geo'
import { PropertyBottomSheet } from '../components/map/PropertyBottomSheet'

export default function MapPage() {
  const { location, setIsModalOpen, detectCurrentLocation } = useUserLocation()
  const { data: listings = [], isLoading } = useSearchListings({ available_only: 'true' })

  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const markersRef = useRef<{ [id: string]: L.Marker }>({})

  const [selectedPgId, setSelectedPgId] = useState<string | null>(null)

  // Default fallback center (Hyderabad / Bangalore)
  const centerLat = location.latitude || 17.3850
  const centerLng = location.longitude || 78.4867

  // Process listings with distance calculations
  const mapPGs = useMemo(() => {
    if (!listings) return []
    return listings.map((pg: any) => {
      const lat = pg.latitude ? Number(pg.latitude) : null
      const lng = pg.longitude ? Number(pg.longitude) : null
      const dist = lat && lng && location.latitude && location.longitude
        ? calculateDistance(location.latitude, location.longitude, lat, lng)
        : Infinity
      const price = pg.pg_rooms?.[0]?.price || 6500

      return {
        ...pg,
        lat,
        lng,
        distanceKm: dist,
        price,
      }
    })
  }, [listings, location.latitude, location.longitude])

  // Selected PG details
  const selectedPg = useMemo(() => {
    return mapPGs.find((p) => p.id === selectedPgId) || mapPGs[0] || null
  }, [mapPGs, selectedPgId])

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([centerLat, centerLng], 12)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add Zoom Control to top right
      L.control.zoom({ position: 'topright' }).addTo(map)

      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update map view & markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    // Add User Location marker if GPS available
    if (location.latitude && location.longitude) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-black">
              📍
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })

      L.marker([location.latitude, location.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>📍 You are here</b>')
    }

    // Add PG Markers
    mapPGs.forEach((pg) => {
      if (!pg.lat || !pg.lng) return

      const isSelected = pg.id === selectedPgId
      const priceText = `₹${pg.price.toLocaleString('en-IN')}`

      const badgeBg = isSelected 
        ? 'bg-slate-900 border-slate-700 scale-110'
        : pg.verified
        ? 'bg-emerald-600 border-emerald-400'
        : pg.featured
        ? 'bg-blue-600 border-blue-400'
        : 'bg-slate-800 border-slate-600'

      const markerHtml = `
        <div class="transition-all transform ${isSelected ? 'z-[1000]' : 'hover:scale-105'}">
          <div class="px-2.5 py-1 rounded-full text-white font-black text-xs shadow-lg border ${badgeBg} flex items-center gap-1 transition-all">
            <span>${priceText}</span>
          </div>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'custom-pg-marker',
        html: markerHtml,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      })

      const marker = L.marker([pg.lat, pg.lng], { 
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 0
      }).addTo(map)

      marker.on('click', () => {
        setSelectedPgId(pg.id)
        // Offset the center so the marker isn't hidden by the bottom sheet
        const targetPoint = map.project([pg.lat, pg.lng], 15).subtract([0, -120])
        const targetLatLng = map.unproject(targetPoint, 15)
        map.flyTo(targetLatLng, 15, { duration: 0.6 })
      })

      markersRef.current[pg.id] = marker
    })

    // Auto-fit bounds if we have PGs with coordinates
    const validCoords = mapPGs.filter((p) => p.lat && p.lng).map((p) => [p.lat!, p.lng!] as [number, number])
    if (validCoords.length > 0 && !selectedPgId) {
      if (location.latitude && location.longitude) {
        validCoords.push([location.latitude, location.longitude])
      }
      const bounds = L.latLngBounds(validCoords)
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    }
  }, [mapPGs, location.latitude, location.longitude, selectedPgId])

  // Center map on user location
  const handleRecenter = () => {
    if (location.latitude && location.longitude && mapRef.current) {
      mapRef.current.flyTo([location.latitude, location.longitude], 15, { duration: 1 })
    } else {
      detectCurrentLocation()
    }
  }

  // Open Google Maps Directions
  const handleGetDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  return (
    <PageWrapper>
      <Helmet>
        <title>Interactive Map View | NearPG</title>
        <meta name="description" content="Discover PGs and hostels near you on an interactive live map with real prices and instant directions." />
      </Helmet>

      {/* Main Container - use flex-1 to fill available space gracefully, without fixed viewport hacks */}
      <div className="flex-1 w-full relative flex flex-col bg-slate-100 overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between gap-3 pointer-events-none pt-[env(safe-area-inset-top)]">
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              to="/"
              className="min-h-[44px] min-w-[44px] px-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 shadow-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back</span>
            </Link>

            <button
              onClick={() => setIsModalOpen(true)}
              className="min-h-[44px] px-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-blue-50 transition-transform active:scale-95"
            >
              <MapPin size={16} className="text-blue-600" />
              <span>{location.cityName || 'Select Location'}</span>
            </button>
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={handleRecenter}
              className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-blue-600 shadow-lg flex items-center justify-center hover:bg-blue-50 transition-transform active:scale-95"
              title="Re-center to your location"
            >
              <Compass size={22} />
            </button>
          </div>
        </div>

        {/* Map Container - fills available flex space */}
        <div ref={mapContainerRef} className="w-full flex-1 z-10 bg-slate-200" />

        {/* Bottom Sheet Component */}
        <div className="z-[500]">
          <PropertyBottomSheet 
            pg={selectedPg} 
            onClose={() => setSelectedPgId(null)} 
            onGetDirections={handleGetDirections}
          />
        </div>
      </div>
    </PageWrapper>
  )
}
