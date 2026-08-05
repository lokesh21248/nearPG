import { motion } from 'framer-motion'
import { Calendar, Phone } from 'lucide-react'

interface StickyBookBarProps {
  price: number | null
  onBookClick: () => void
  ownerPhone?: string
}

export function StickyBookBar({ price, onBookClick, ownerPhone }: StickyBookBarProps) {
  return (
    <div
      className="lg:hidden fixed bottom-16 sm:bottom-0 left-0 right-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-slate-200"
      style={{ boxShadow: '0 -8px 32px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Starts from</p>
          {price ? (
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-medium text-slate-400">/mo</span>
            </div>
          ) : (
            <span className="text-sm font-bold text-slate-700">Price on request</span>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {ownerPhone && (
            <motion.a
              whileTap={{ scale: 0.95 }}
              href={`tel:${ownerPhone}`}
              className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <Phone size={18} />
            </motion.a>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onBookClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 4px 16px rgba(37,99,235,0.30)' }}
          >
            <Calendar size={16} />
            Book Visit
          </motion.button>
        </div>
      </div>
    </div>
  )
}
