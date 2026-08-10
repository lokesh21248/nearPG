import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Heart, Star, CheckCircle2, Wifi, Wind, Car, Utensils, Users, Dumbbell, ArrowRight, Image } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PGLite } from '../../types/pg.types'
import { useWishlistIds, useToggleWishlist } from '../../hooks/useWishlist'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import { useToast } from '../ui/Toast'
import { NoImageFallback } from '../ui/NoImageFallback'

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
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/50 text-slate-600 text-[11px] font-semibold">
      {Icon ? <Icon size={11} className="text-slate-500" /> : null}
      <span>{name}</span>
    </div>
  )
}

export function PGCard({ pg }: { pg: PGLite }) {
  const { isAuthenticated } = useFirebaseAuth()
  const { showToast }       = useToast()
  const { data: wishlistIds = [] } = useWishlistIds()
  const { mutate: toggleWishlist, isPending } = useToggleWishlist()
  const [imgError, setImgError] = useState(false)

  const isWished    = wishlistIds.includes(pg.id)
  const thumbnail   = pg.pg_images?.[0]?.image_url
  const prices      = (pg.pg_rooms || []).map(r => Number(r.price)).filter(Boolean)
  const startPrice  = prices.length > 0 ? Math.min(...prices) : null
  const amenities   = (pg.pg_amenities || []).slice(0, 3).map(a => a.amenity_name)
  const showImage   = thumbnail && !imgError

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) { showToast('Please login to save to wishlist', 'error'); return }
    toggleWishlist({ pgId: pg.id, isWished })
  }

  return (
    <Link to={`/pg/${pg.id}`} className="pg-card group flex flex-col h-full rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[4/3]">
        {/* Skeleton */}
        <div className="absolute inset-0 bg-slate-200" />
        {showImage ? (
          <img
            src={thumbnail}
            alt={pg.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <NoImageFallback className="absolute inset-0 w-full h-full" iconSize={32} />
        )}
        {/* Gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {pg.featured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md">
              <Star size={10} className="fill-amber-950" /> Featured
            </span>
          )}
          {pg.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
              <CheckCircle2 size={10} strokeWidth={3} /> Verified
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <motion.button
          onClick={handleWishlist}
          disabled={isPending}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-2.5 right-2.5 w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md z-10 ${
            isWished
              ? 'bg-rose-500/90 text-white shadow-rose-500/30'
              : 'bg-white/40 hover:bg-white text-white hover:text-slate-800'
          }`}
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={16}
            className={`transition-colors ${isWished ? 'fill-white text-white' : 'text-white group-hover:text-slate-700'}`}
            strokeWidth={isWished ? 0 : 2.2}
          />
        </motion.button>

        {/* Gender badge bottom-left */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm backdrop-blur-sm ${
            pg.gender === 'Men'    ? 'bg-blue-600/90 text-white' :
            pg.gender === 'Women' ? 'bg-rose-600/90 text-white' :
                                    'bg-purple-600/90 text-white'
          }`}>
            <Users size={10} />
            For {pg.gender}
          </span>
        </div>

        {/* Image count badge */}
        {(pg.pg_images?.length ?? 0) > 1 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold z-10 flex items-center gap-1">
            <Image size={12} strokeWidth={2.5} /> {pg.pg_images?.length}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        {/* Header with Name */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
            {pg.name}
          </h3>
          {pg.verified && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold shrink-0">
              <CheckCircle2 size={10} strokeWidth={3} />
              <span>Verified</span>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-500 text-xs font-medium mb-2.5">
          <MapPin size={12} className="text-blue-600 shrink-0" />
          <span className="line-clamp-1">{pg.area}, {pg.city}</span>
        </div>

        {/* Amenity chips */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-3">
            {amenities.map(a => <AmenityChip key={a} name={a} />)}
          </div>
        )}

        {/* Price & Premium CTA Button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Starts from</p>
            {startPrice ? (
              <div className="flex items-baseline gap-0.5">
                <span className="text-base sm:text-lg font-black text-slate-900">₹{startPrice.toLocaleString('en-IN')}</span>
                <span className="text-[11px] text-slate-400 font-semibold">/mo</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-700">On Request</span>
            )}
          </div>
          <div className="shrink-0">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700 shadow-md group-hover:shadow-blue-500/25 transition-all min-h-[44px]">
              <span>View PG</span>
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
