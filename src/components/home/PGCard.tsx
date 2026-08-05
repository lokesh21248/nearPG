import { Link } from 'react-router-dom'
import { MapPin, Heart, Star, CheckCircle2, Wifi, Wind, Car, Utensils, Users, Dumbbell } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PGLite } from '../../types/pg.types'
import { Badge } from '../ui/Badge'
import { useWishlistIds, useToggleWishlist } from '../../hooks/useWishlist'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import { useToast } from '../ui/Toast'

const AMENITY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  WiFi:    Wifi,
  AC:      Wind,
  Parking: Car,
  Food:    Utensils,
  Gym:     Dumbbell,
}

function AmenityChip({ name }: { name: string }) {
  const Icon = Object.entries(AMENITY_ICONS).find(([k]) => name.toLowerCase().includes(k.toLowerCase()))?.[1]
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
      {Icon ? <Icon size={11} /> : null}
      <span>{name}</span>
    </div>
  )
}

export function PGCard({ pg }: { pg: PGLite }) {
  const { isAuthenticated } = useFirebaseAuth()
  const { showToast }       = useToast()
  const { data: wishlistIds = [] } = useWishlistIds()
  const { mutate: toggleWishlist, isPending } = useToggleWishlist()

  const isWished    = wishlistIds.includes(pg.id)
  const thumbnail   = pg.pg_images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800'
  const prices      = (pg.pg_rooms || []).map(r => Number(r.price)).filter(Boolean)
  const startPrice  = prices.length > 0 ? Math.min(...prices) : null
  const amenities   = (pg.pg_amenities || []).slice(0, 3).map(a => a.amenity_name)

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { showToast('Please login to save to wishlist', 'error'); return }
    toggleWishlist({ pgId: pg.id, isWished })
  }

  return (
    <Link to={`/pg/${pg.id}`} className="pg-card group flex flex-col h-full">
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {/* Skeleton */}
        <div className="absolute inset-0 bg-slate-200" />
        <img
          src={thumbnail}
          alt={pg.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          loading="lazy"
        />
        {/* Gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {pg.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 shadow-sm">
              <Star size={10} className="fill-amber-900" /> Featured
            </span>
          )}
          {pg.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 size={10} strokeWidth={3} /> Verified
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          onClick={handleWishlist}
          disabled={isPending}
          whileTap={{ scale: 0.85 }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/25 hover:bg-white backdrop-blur-md flex items-center justify-center transition-all shadow-sm z-10"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={17}
            className={`transition-colors ${isWished ? 'fill-rose-500 text-rose-500' : 'text-white'}`}
            strokeWidth={isWished ? 0 : 2}
          />
        </motion.button>

        {/* Gender badge bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
            pg.gender === 'Men'    ? 'bg-blue-500/90 text-white' :
            pg.gender === 'Women' ? 'bg-rose-500/90 text-white' :
                                    'bg-slate-700/90 text-white'
          }`}>
            <Users size={10} />
            For {pg.gender}
          </span>
        </div>

        {/* Image count badge */}
        {(pg.pg_images?.length ?? 0) > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
            📷 {pg.pg_images?.length}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1">
        {/* Header with Name & Rating */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {pg.name}
          </h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/60 text-amber-800 text-[11px] font-extrabold shrink-0">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>4.8</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-2 sm:mb-3">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span className="line-clamp-1">{pg.area}, {pg.city}</span>
        </div>

        {/* Amenity chips */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3 sm:mb-4">
            {amenities.map(a => <AmenityChip key={a} name={a} />)}
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Starts from</p>
            {startPrice ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-base sm:text-xl font-black text-slate-900">₹{startPrice.toLocaleString('en-IN')}</span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium">/mo</span>
              </div>
            ) : (
              <span className="text-xs sm:text-sm font-bold text-slate-700">On Request</span>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
              View Details
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
