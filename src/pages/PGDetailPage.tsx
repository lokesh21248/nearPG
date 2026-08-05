import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Share2, Heart, CheckCircle2, ChevronRight, Map } from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { ImageGallery } from '../components/detail/ImageGallery'
import { RoomTypes } from '../components/detail/RoomTypes'
import { AmenitiesGrid } from '../components/detail/AmenitiesGrid'
import { ReviewsList } from '../components/detail/ReviewsList'
import { ContactCard } from '../components/detail/ContactCard'
import { BookVisitModal } from '../components/detail/BookVisitModal'
import { StickyBookBar } from '../components/detail/StickyBookBar'
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton'
import { Badge } from '../components/ui/Badge'
import { useListing } from '../hooks/useListing'
import { useWishlistIds, useToggleWishlist } from '../hooks/useWishlist'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { useToast } from '../components/ui/Toast'

export default function PGDetailPage() {
  const { id } = useParams()
  const { isAuthenticated } = useFirebaseAuth()
  const { showToast } = useToast()
  
  const { data: pg, isLoading, error } = useListing(id!)
  const { data: wishlistIds = [] } = useWishlistIds()
  const { mutate: toggleWishlist, isPending: togglingWishlist } = useToggleWishlist()
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <LoadingSkeleton variant="text" className="h-8 w-1/3" />
          <LoadingSkeleton variant="image" className="aspect-[21/9] w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <LoadingSkeleton variant="text" className="h-32 w-full" />
              <LoadingSkeleton variant="text" className="h-48 w-full" />
            </div>
            <LoadingSkeleton variant="text" className="h-64 w-full" />
          </div>
        </div>
      </PageWrapper>
    )
  }

  if (error || !pg) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">PG Not Found</h2>
          <p className="text-slate-500 mb-6">The property you are looking for does not exist or has been removed.</p>
          <Link to="/search" className="btn-primary">Back to Search</Link>
        </div>
      </PageWrapper>
    )
  }

  const isWished = wishlistIds.includes(pg.id)
  
  const prices = (pg.pg_rooms || []).map(r => Number(r.price)).filter(Boolean)
  const startingPrice = prices.length > 0 ? Math.min(...prices) : null

  const handleWishlist = () => {
    if (!isAuthenticated) {
      showToast('Please login to save to wishlist', 'error')
      return
    }
    toggleWishlist({ pgId: pg.id, isWished })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pg.name,
        text: `Check out ${pg.name} on NearPG`,
        url: window.location.href,
      }).catch(console.error)
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard')
    }
  }

  const mapEmbedUrl = pg.latitude && pg.longitude 
    ? `https://maps.google.com/maps?q=${pg.latitude},${pg.longitude}&z=15&output=embed`
    : null

  return (
    <PageWrapper>
      <Helmet>
        <title>{pg.name} - PG in {pg.city} | NearPG</title>
        <meta name="description" content={pg.description.substring(0, 160)} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight size={14} />
          <Link to={`/search?city=${pg.city}`} className="hover:text-indigo-600">{pg.city}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900 truncate">{pg.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32 lg:pb-12">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={pg.gender === 'Men' ? 'blue' : pg.gender === 'Women' ? 'purple' : 'gray'}>
                For {pg.gender}
              </Badge>
              {pg.verified && <Badge variant="green"><CheckCircle2 size={12} strokeWidth={3} /> Verified</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">{pg.name}</h1>
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin size={16} className="text-indigo-500 shrink-0" />
              <span>{pg.address}, {pg.area}, {pg.city} {pg.state ? `, ${pg.state}` : ''}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleShare} className="p-2 sm:px-4 sm:py-2.5 flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold rounded-full sm:rounded-xl transition-colors shadow-sm">
              <Share2 size={18} />
              <span className="hidden sm:block">Share</span>
            </button>
            <button onClick={handleWishlist} disabled={togglingWishlist} className="p-2 sm:px-4 sm:py-2.5 flex items-center gap-2 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 font-semibold rounded-full sm:rounded-xl transition-colors shadow-sm">
              <Heart size={18} className={isWished ? 'fill-rose-500 text-rose-500' : ''} />
              <span className="hidden sm:block">{isWished ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-5 sm:mb-12">
          <ImageGallery images={pg.pg_images || []} />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-12">
            
            {/* About */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">About this Property</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                {pg.description}
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Couples Allowed</p>
                  <p className="font-semibold text-slate-800">{pg.couples_allowed ? 'Yes' : 'No'}</p>
                </div>
                <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bachelor Friendly</p>
                  <p className="font-semibold text-slate-800">{pg.bachelor_friendly ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </section>

            {/* Room Types */}
            <section>
              <RoomTypes rooms={pg.pg_rooms || []} />
            </section>

            {/* Amenities */}
            <section>
              <AmenitiesGrid amenities={pg.pg_amenities || []} />
            </section>

            {/* Map */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Location Map</h2>
                {pg.google_map_link && (
                  <a href={pg.google_map_link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Map size={16} /> Open in Google Maps
                  </a>
                )}
              </div>
              <div className="bg-slate-100 rounded-2xl overflow-hidden aspect-video border border-slate-200">
                {mapEmbedUrl ? (
                  <iframe 
                    src={mapEmbedUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={32} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium">Map location not provided</p>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section id="reviews">
              <ReviewsList pgId={pg.id} />
            </section>

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 hidden lg:block">
            <ContactCard 
              ownerPhone={pg.owner_phone}
              receptionPhone={pg.reception_phone}
              whatsappNumber={pg.whatsapp_number}
              onBookClick={() => setIsModalOpen(true)}
            />
          </div>
        </div>
      </div>

      <StickyBookBar price={startingPrice} onBookClick={() => setIsModalOpen(true)} />
      
      <BookVisitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        pgId={pg.id} 
        pgName={pg.name} 
      />
    </PageWrapper>
  )
}
