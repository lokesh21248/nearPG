import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { HeroSearch } from '../components/home/HeroSearch'
import { CategoryNav } from '../components/home/CategoryNav'
import { NearbyPGsSection } from '../components/home/NearbyPGsSection'
import { PopularCities } from '../components/home/PopularCities'
import { PGListingSection } from '../components/home/PGListingSection'
import { GlobalReviewsSection } from '../components/home/GlobalReviewsSection'
import { useFeaturedListings, useRecentListings } from '../hooks/useListings'
import {
  Shield, MessageCircle, CalendarCheck, ChevronRight, CheckCircle2,
  Search, Building2, Calendar, Map
} from 'lucide-react'

/* ── How It Works — compact strip ── */
const HOW_STEPS = [
  { icon: Search, title: 'Search',  desc: 'Filter by city, area, budget and gender.' },
  { icon: Building2, title: 'Explore', desc: 'View photos, rooms, amenities and location.' },
  { icon: Calendar, title: 'Visit',   desc: 'Book a free visit at your convenience.' },
  { icon: CheckCircle2, title: 'Move In', desc: 'Finalise directly with the owner. Zero brokerage.' },
]

/* ── Trust features — only honest, real claims ── */
const TRUST_FEATURES = [
  { icon: MessageCircle, title: 'Direct Owner Contact',     desc: 'Phone and WhatsApp directly with owners — no middlemen.' },
  { icon: Shield,        title: 'Transparent Pricing',      desc: 'Real prices with room-type breakdown, no hidden charges.' },
  { icon: CalendarCheck, title: 'Free Visit Booking',       desc: 'Schedule a property visit at no cost, anytime.' },
]

export default function HomePage() {
  const { data: featuredPGs, isLoading: loadingFeatured } = useFeaturedListings()
  const { data: recentPGs,   isLoading: loadingRecent   } = useRecentListings()

  return (
    <PageWrapper>
      <Helmet>
        <title>NearPG — Find PG, Rooms &amp; Hostels Near You</title>
        <meta name="description" content="Discover PGs, hostels and coliving spaces with real listings, transparent prices and direct owner contact." />
      </Helmet>

      {/* 1. Compact search */}
      <HeroSearch />

      {/* 2. Category navigation */}
      <CategoryNav />

      {/* 3. PGs near you */}
      <NearbyPGsSection />

      {/* 4. Popular cities */}
      <PopularCities />

      {/* 5. Featured PGs */}
      <PGListingSection
        title="Featured stays"
        subtitle="Top-rated properties with premium amenities"
        linkText="View all featured"
        linkUrl="/search"
        listings={featuredPGs}
        isLoading={loadingFeatured}
      />

      {/* 6. Map discovery — compact inline */}
      <section className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="page-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl shrink-0 shadow-md">
                <Map size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>
                  Explore PGs on the map
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  See real property locations, distances and prices on an interactive map.
                </p>
              </div>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95 shrink-0"
            >
              Open Map
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Recently added */}
      <PGListingSection
        title="Recently added"
        subtitle="Fresh listings just added to NearPG"
        linkText="Explore new listings"
        linkUrl="/search?sort=newest"
        listings={recentPGs}
        isLoading={loadingRecent}
      />

      {/* 8. Real reviews */}
      <GlobalReviewsSection />

      {/* 9. How NearPG works — compact strip */}
      <section className="py-10 sm:py-14 bg-white border-t border-slate-100">
        <div className="page-container">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>
              How NearPG works
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start justify-center gap-0 max-w-3xl mx-auto">
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 flex-1 relative px-3 py-3 sm:py-0 sm:text-center">
                {/* Arrow between steps (desktop) */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute right-0 top-5 text-slate-300 font-light text-xl">→</div>
                )}
                <div className="shrink-0 p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{s.title}</p>
                  <p className="text-xs text-slate-500 leading-snug mt-0.5 max-w-[120px] mx-auto">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Trust section — honest, compact */}
      <section className="py-10 sm:py-14 bg-slate-50 border-t border-slate-100">
        <div className="page-container">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>
              Why tenants choose NearPG
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {TRUST_FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3 shadow-sm">
                <f.icon size={22} className="text-blue-600" strokeWidth={1.5} />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1">{f.desc}</p>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-semibold">Free for tenants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
