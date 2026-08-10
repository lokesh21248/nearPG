import { Link } from 'react-router-dom'
import { MapPin, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { usePopularCities } from '../../hooks/useLocations'

const COLORS = [
  'from-orange-500 to-pink-600',
  'from-blue-500 to-cyan-600',
  'from-violet-500 to-purple-700',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600'
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item      = { hidden: { opacity: 0, scale: 0.94 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as any } } }

export function PopularCities() {
  const ref  = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const { data: popularCities = [], isLoading } = usePopularCities()

  if (isLoading) return <div className="text-center py-8 text-slate-500 text-sm">Loading popular cities...</div>
  if (!popularCities.length) return null

  return (
    <section className="py-8 sm:py-16 bg-white">
      <div className="page-container">
        <div className="text-center mb-8 sm:mb-12" ref={ref}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">
            <MapPin size={12} />
            Explore By City
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Find PGs in Top Cities</h2>
          <p className="text-xs sm:text-base text-slate-500 max-w-xl mx-auto mt-2">Discover verified PGs, hostels, and coliving spaces in top cities</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {popularCities.map((city, idx) => (
            <motion.div key={city.name} variants={item}>
              <Link
                to={`/search?city=${city.name}`}
                className="group block relative rounded-xl sm:rounded-2xl overflow-hidden img-zoom shadow-sm hover:shadow-xl transition-shadow duration-300"
                style={{ aspectRatio: '4/5' }}
              >
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                  <Building2 size={32} className="text-slate-400" />
                </div>
                {city.imageUrl && (
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                {/* Hover overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${COLORS[idx % COLORS.length]} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

                <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4">
                  <h3 className="text-sm sm:text-lg font-black text-white leading-tight group-hover:text-blue-200 transition-colors" style={{ fontFamily: 'Outfit,sans-serif' }}>
                    {city.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium">{city.pgCount}+ Properties</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
