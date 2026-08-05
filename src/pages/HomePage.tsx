import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { HeroSearch } from '../components/home/HeroSearch'
import { NearbyPGsSection } from '../components/home/NearbyPGsSection'
import { PopularCities } from '../components/home/PopularCities'
import { PGListingSection } from '../components/home/PGListingSection'
import { useFeaturedListings, useRecentListings } from '../hooks/useListings'
import {
  Shield, MessageCircle, CalendarCheck, Star, ChevronRight, CheckCircle2,
  Smartphone, Download, Phone
} from 'lucide-react'

/* ── How It Works ── */
const HOW_STEPS = [
  {
    step: '01', icon: '🔍', title: 'Search & Filter',
    desc: 'Browse thousands of verified PGs. Filter by city, budget, gender, amenities, and sharing type.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    step: '02', icon: '🏠', title: 'Explore Listings',
    desc: 'View detailed photos, room types, amenities, and read honest reviews from real tenants.',
    color: 'from-violet-500 to-violet-700',
  },
  {
    step: '03', icon: '📅', title: 'Book a Visit',
    desc: 'Schedule a free property visit at your convenience. Meet the owner directly — no middlemen.',
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    step: '04', icon: '🎉', title: 'Move In',
    desc: 'Finalize your stay directly with the owner. Zero brokerage, transparent pricing.',
    color: 'from-orange-500 to-orange-700',
  },
]

/* ── Testimonials ── */
const REVIEWS = [
  {
    name: 'Priya Sharma',    city: 'Bangalore', initials: 'PS', rating: 5,
    text: 'Found an amazing PG in Koramangala within 2 days! The photos matched exactly and the owner was super helpful. Zero brokerage saved me ₹15,000.',
    bg: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Rahul Verma',     city: 'Pune',      initials: 'RV', rating: 5,
    text: 'NearPG made my relocation so smooth. The filter system is excellent — I found exactly what I needed in my budget in under an hour.',
    bg: 'from-violet-400 to-violet-600',
  },
  {
    name: 'Ananya Reddy',    city: 'Hyderabad', initials: 'AR', rating: 5,
    text: 'As a woman relocating alone, safety was my priority. NearPG\'s verified listings and detailed amenity information gave me confidence.',
    bg: 'from-emerald-400 to-emerald-600',
  },
]

/* ── FAQ ── */
const FAQS = [
  { q: 'Is NearPG free to use?',                      a: 'Yes! Searching, browsing, and booking visits on NearPG is completely free for tenants.' },
  { q: 'Are the listings verified?',                   a: 'Every PG on our platform goes through a physical verification process by our team before being listed.' },
  { q: 'Can I contact the PG owner directly?',         a: 'Absolutely. We provide direct contact details (phone & WhatsApp) so you can communicate without any middlemen.' },
  { q: 'Is there any brokerage fee?',                  a: 'None. NearPG charges zero brokerage. You deal directly with the PG owner.' },
  { q: 'How do I book a visit?',                       a: 'Click "Book a Visit" on any listing, choose your preferred date & time, and submit. The owner will confirm shortly.' },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-800 text-sm sm:text-base">{q}</span>
        <ChevronRight size={18} className={`text-slate-400 transition-transform shrink-0 ml-4 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5 bg-white">
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

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

export default function HomePage() {
  const { data: featuredPGs, isLoading: loadingFeatured } = useFeaturedListings()
  const { data: recentPGs,   isLoading: loadingRecent   } = useRecentListings()

  return (
    <PageWrapper>
      <Helmet>
        <title>NearPG — Find PG, Rooms &amp; Hostels Near You</title>
        <meta name="description" content="Discover the best PGs, Hostels, and Coliving spaces with real reviews, instant bookings, and verified hosts." />
      </Helmet>

      {/* Hero */}
      <HeroSearch />

      {/* Geolocation Nearby PGs */}
      <NearbyPGsSection />

      {/* Popular Cities */}
      <PopularCities />

      {/* Featured PGs */}
      <PGListingSection
        title="Featured Properties"
        subtitle="Handpicked premium stays with top-notch amenities"
        linkText="View all featured"
        linkUrl="/search"
        listings={featuredPGs}
        isLoading={loadingFeatured}
      />

      {/* ── How It Works ── */}
      <section className="section-pad bg-white">
        <div className="page-container">
          <FadeSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold uppercase tracking-wider mb-4">
              <CalendarCheck size={12} />
              Simple Process
            </div>
            <h2 className="section-title">How NearPG Works</h2>
            <p className="section-subtitle max-w-xl mx-auto">Finding your new home is as easy as 1, 2, 3, 4</p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_STEPS.map((s, i) => (
              <FadeSection key={s.step}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow h-full"
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shadow-md">
                    {s.step}
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-3xl mb-5 shadow-md`}>
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                  {i < HOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 -right-3 w-6 text-slate-300 text-xl">→</div>
                  )}
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <PGListingSection
        title="Recently Added"
        subtitle="Fresh new properties just listed on NearPG"
        linkText="Explore new listings"
        linkUrl="/search?sort=newest"
        listings={recentPGs}
        isLoading={loadingRecent}
      />

      {/* ── Why Choose Us ── */}
      <section className="section-pad" style={{ background: 'linear-gradient(135deg,#0F1F5C 0%,#1D4ED8 55%,#5B21B6 100%)' }}>
        <div className="page-container">
          <FadeSection className="text-center mb-12">
            <h2 className="section-title text-white">Why Thousands Trust NearPG</h2>
            <p className="mt-3 text-blue-200 max-w-xl mx-auto">We've built India's most reliable PG discovery platform from the ground up</p>
          </FadeSection>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield,         emoji: '🛡️', title: '100% Verified',    desc: 'Every PG is physically verified by our team. Photos match reality — guaranteed.' },
              { icon: MessageCircle,  emoji: '💬', title: 'Direct Contact',   desc: 'Chat directly with owners via WhatsApp or Phone. No middlemen, no hidden brokerage.' },
              { icon: CalendarCheck,  emoji: '⚡', title: 'Instant Booking',  desc: 'Schedule a free property visit instantly at your preferred date and time. No waiting.' },
            ].map(f => (
              <FadeSection key={f.title}>
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="p-8 rounded-2xl h-full"
                  style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div className="text-4xl mb-5">{f.emoji}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-blue-100/80 text-sm leading-relaxed">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-semibold">Always free for tenants</span>
                  </div>
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section-pad bg-white">
        <div className="page-container">
          <FadeSection className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-4">
              <Star size={12} className="fill-amber-500 text-amber-500" />
              Happy Tenants
            </div>
            <h2 className="section-title">What Our Tenants Say</h2>
            <p className="section-subtitle">Discover verified PGs, Hostels &amp; Coliving spaces across India</p>
          </FadeSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map(r => (
              <FadeSection key={r.name}>
                <motion.div whileHover={{ y: -4 }} className="card p-6 h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6">"{r.text}"</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${r.bg} flex items-center justify-center text-white text-sm font-bold`}>
                      {r.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{r.name}</p>
                      <p className="text-slate-400 text-xs">{r.city}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Download Banner ── */}
      <section className="section-pad" style={{ background: 'linear-gradient(135deg,#F0FDF4 0%,#ECFDF5 100%)', borderTop: '1px solid #D1FAE5', borderBottom: '1px solid #D1FAE5' }}>
        <div className="page-container">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <FadeSection className="flex-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-5">
                <Smartphone size={12} />
                Coming Soon
              </div>
              <h2 className="section-title text-slate-900 mb-4">NearPG on Your Phone</h2>
              <p className="text-slate-600 leading-relaxed mb-8 max-w-md">
                Get instant notifications for new PGs in your preferred area, save favourites, and book visits — all from your phone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors shadow-lg">
                  <div className="text-2xl">📱</div>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Download on the</p>
                    <p className="font-bold text-sm">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-colors shadow-lg">
                  <Download size={20} className="text-emerald-400" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">Get it on</p>
                    <p className="font-bold text-sm">Google Play</p>
                  </div>
                </button>
              </div>
            </FadeSection>
            <FadeSection>
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center">
                  <Smartphone size={120} className="text-emerald-600 animate-float" strokeWidth={1} />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-2xl animate-float" style={{ animationDelay: '0.5s' }}>🏠</div>
                <div className="absolute bottom-4 -left-6 px-4 py-2 bg-white rounded-xl shadow-xl text-sm font-bold text-slate-900 animate-float" style={{ animationDelay: '1s' }}>New PG Alert! 🔔</div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-pad bg-white">
        <div className="page-container max-w-3xl">
          <FadeSection className="text-center mb-12">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Got questions? We've got answers.</p>
          </FadeSection>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <FadeSection className="mt-12 text-center p-8 rounded-3xl bg-slate-50 border border-slate-200">
            <Phone size={32} className="mx-auto mb-4 text-blue-500" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Still have questions?</h3>
            <p className="text-slate-500 text-sm mb-6">Our team is available Mon–Sat, 9AM–7PM</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+919876543210" className="btn-primary text-sm">
                <Phone size={16} />
                Call Us
              </a>
              <Link to="/contact" className="btn-secondary text-sm">
                Send a Message
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </PageWrapper>
  )
}
