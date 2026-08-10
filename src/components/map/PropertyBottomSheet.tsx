import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Navigation, ExternalLink, ShieldCheck, X } from 'lucide-react'
import { NoImageFallback } from '../ui/NoImageFallback'
import { formatDistance } from '../../lib/geo'

interface PropertyBottomSheetProps {
  pg: any | null
  onClose: () => void
  onGetDirections: (lat: number, lng: number) => void
}

export function PropertyBottomSheet({ pg, onClose, onGetDirections }: PropertyBottomSheetProps) {
  return (
    <AnimatePresence>
      {pg && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 sm:hidden pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 50 || info.velocity.y > 500) {
                onClose()
              }
            }}
            className="fixed sm:absolute bottom-0 sm:bottom-4 left-0 right-0 sm:left-4 sm:right-auto sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 z-40 pointer-events-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Drag Handle (Mobile only) */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden sm:flex absolute top-3 right-3 w-8 h-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-5">
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 relative shadow-sm">
                  {pg.pg_images?.[0]?.image_url ? (
                    <img
                      src={pg.pg_images[0].image_url}
                      alt={pg.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <NoImageFallback className="absolute inset-0 w-full h-full" iconSize={24} />
                  )}
                  {pg.verified && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-md">
                      <ShieldCheck size={10} />
                      Verified
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-lg leading-tight truncate">
                      {pg.name}
                    </h4>
                    <span className="text-blue-600 font-black text-base mt-1 block">
                      ₹{pg.price?.toLocaleString('en-IN') || 6500}
                      <span className="text-[10px] text-slate-400 font-medium ml-1">/mo</span>
                    </span>

                    <p className="text-xs text-slate-500 truncate mt-1">
                      📍 {pg.area}, {pg.city}
                    </p>

                    {pg.distanceKm && pg.distanceKm !== Infinity && (
                      <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                        <Navigation size={12} />
                        <span>{formatDistance(pg.distanceKm)} away</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
                {pg.lat && pg.lng && (
                  <button
                    onClick={() => onGetDirections(pg.lat!, pg.lng!)}
                    className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={16} />
                    Directions
                  </button>
                )}
                <Link
                  to={`/pg/${pg.id}`}
                  className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
