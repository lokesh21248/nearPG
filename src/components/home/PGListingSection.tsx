import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { PGCard } from './PGCard'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'
import type { PGLite } from '../../types/pg.types'

interface PGListingSectionProps {
  title: string
  subtitle: string
  linkText: string
  linkUrl: string
  listings?: PGLite[]
  isLoading: boolean
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } }
const cardItem  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as any } } }

export function PGListingSection({ title, subtitle, linkText, linkUrl, listings = [], isLoading }: PGListingSectionProps) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-8 sm:py-16" style={{ background: 'var(--bg-page)' }}>
      <div className="page-container">

        {/* Header */}
        <div ref={ref} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-10">
          <div>
            <h2 className="section-title">{title}</h2>
            <p className="section-subtitle">{subtitle}</p>
          </div>
          <Link
            to={linkUrl}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 group shrink-0 transition-colors"
          >
            {linkText}
            <div className="w-7 h-7 rounded-full border-2 border-blue-200 group-hover:bg-blue-600 group-hover:border-blue-600 flex items-center justify-center transition-all">
              <ArrowRight size={14} className="text-blue-500 group-hover:text-white transition-colors group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <LoadingSkeleton key={i} variant="card" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-5xl mb-4">🏠</p>
            <p className="font-semibold">No properties available right now</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {listings.map(pg => (
              <motion.div key={pg.id} variants={cardItem}>
                <PGCard pg={pg} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
