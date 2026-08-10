import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star } from 'lucide-react'
import { useGlobalReviews } from '../../hooks/useReviews'

const COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
]

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function GlobalReviewsSection() {
  const { data: reviews = [], isLoading } = useGlobalReviews()

  if (isLoading) return <div className="py-12 text-center text-slate-500">Loading reviews...</div>
  
  if (!reviews || reviews.length === 0) {
    return null
  }

  return (
    <section className="section-pad bg-white">
      <div className="page-container">
        <FadeSection className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            Happy Tenants
          </div>
          <h2 className="section-title">What Our Tenants Say</h2>
          <p className="section-subtitle">Real feedback from verified NearPG users</p>
        </FadeSection>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((r, idx) => {
            const initials = r.user_name ? r.user_name.substring(0, 2).toUpperCase() : 'U'
            const bg = COLORS[idx % COLORS.length]
            const pgName = r.pg_listings?.name || 'NearPG User'
            const city = r.pg_listings?.city || 'Unknown Location'
            
            return (
              <FadeSection key={r.id}>
                <motion.div whileHover={{ y: -4 }} className="card p-6 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: r.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    "{r.comment || 'Great experience!'}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                      {initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{r.user_name}</p>
                      <p className="text-slate-400 text-xs truncate max-w-[200px]">{pgName} • {city}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeSection>
            )
          })}
        </div>
      </div>
    </section>
  )
}
