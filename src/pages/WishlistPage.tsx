import { Helmet } from 'react-helmet-async'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useWishlist } from '../hooks/useWishlist'
import { PGCard } from '../components/home/PGCard'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { HeartCrack } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PGLite } from '../types/pg.types'

export default function WishlistPage() {
  const { data: wishlist, isLoading } = useWishlist()

  const listings: PGLite[] = wishlist?.map(w => w.pg_listings as unknown as PGLite).filter(Boolean) ?? []

  return (
    <PageWrapper>
      <Helmet>
        <title>My Wishlist | NearPG</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Saved Properties</h1>
        <p className="text-slate-500 font-medium mb-8">Properties you have shortlisted for later.</p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <LoadingSkeleton key={i} variant="card" />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl py-16">
            <EmptyState
              icon={HeartCrack}
              title="Your wishlist is empty"
              description="You haven't saved any properties yet. Start exploring and click the heart icon to save your favorites."
              action={<Link to="/search" className="btn-primary">Explore PGs</Link>}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(pg => (
              <PGCard key={pg.id} pg={pg} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
