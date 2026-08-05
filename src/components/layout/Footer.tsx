import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, ArrowUpRight, Globe } from 'lucide-react'

const FOOTER_LINKS = {
  company:  [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Safety Tips', href: '/safety' },
  ],
  cities: [
    { label: 'PG in Bangalore', href: '/search?city=Bangalore' },
    { label: 'PG in Pune', href: '/search?city=Pune' },
    { label: 'PG in Delhi', href: '/search?city=Delhi' },
    { label: 'PG in Mumbai', href: '/search?city=Mumbai' },
    { label: 'PG in Hyderabad', href: '/search?city=Hyderabad' },
    { label: 'PG in Chennai', href: '/search?city=Chennai' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-24 sm:pb-10">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* ── Brand ── */}
          <div className="lg:col-span-2 space-y-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl"
                style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>N</div>
              <span className="text-xl font-black text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>NearPG</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              India's most trusted PG discovery platform. Find verified PGs, hostels, and coliving spaces — zero brokerage, direct owner contact.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 pt-2">
              {[
                { icon: MapPin,  text: '123 Startup Lane, Koramangala, Bangalore 560034' },
                { icon: Phone,   text: '+91 98765 43210' },
                { icon: Mail,    text: 'hello@nearpg.in' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-slate-400">
                  <Icon size={15} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex gap-3 pt-1">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
            </div>
          </div>

          {/* ── Company ── */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Company</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Support</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Top Cities ── */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-5">Top Cities</h4>
            <ul className="space-y-3">
              {FOOTER_LINKS.cities.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Newsletter strip ── */}
        <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Stay in the loop</h3>
              <p className="text-slate-400 text-sm mt-1">Get notified about new PGs in your city</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-56 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
              />
              <button className="btn-primary px-4 py-2.5 text-sm shrink-0">
                Subscribe
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NearPG Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-slate-300 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
