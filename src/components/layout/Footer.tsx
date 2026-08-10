import { Link } from 'react-router-dom'


const FOOTER_LINKS = {
  company: [
    { label: 'About Us',  href: '/about' },
    { label: 'Blog',      href: '/blog' },
    { label: 'Careers',   href: '/careers' },
    { label: 'Press',     href: '/press' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us',  href: '/contact' },
    { label: 'FAQ',         href: '/faq' },
    { label: 'Safety Tips', href: '/safety' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 sm:pb-10">
      <div className="page-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14">

          {/* ── Brand ── */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl"
                style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>N</div>
              <span className="text-xl font-black text-white" style={{ fontFamily: 'Outfit,sans-serif' }}>NearPG</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Discover PGs, hostels and coliving spaces across India.
              Direct owner contact. Transparent pricing. No brokerage.
            </p>
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

        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} NearPG. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms"   className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
