import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search, Heart, UserCircle2, LogOut, CalendarClock,
  User, Settings, Menu, X, ChevronDown, Home, MapPin, PlusCircle
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'
import { useUserLocation } from '../../contexts/LocationContext'
import { LocationSelectorModal } from '../location/LocationSelectorModal'

const NAV_LINKS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Find PG', href: '/search', icon: MapPin },
]

export function Header() {
  const { isAuthenticated, profile, signOut } = useFirebaseAuth()
  const { location: userLoc, setIsModalOpen } = useUserLocation()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?city=${encodeURIComponent(search.trim())}`)
  }

  const handleSignOut = async () => {
    setMenuOpen(false)
    setMobileOpen(false)
    await signOut()
    navigate('/')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const initials = profile?.full_name
    ? profile.full_name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="page-container h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">

          {/* ── Logo + Location Selector ── */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}
              >
                N
              </div>
              <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit,sans-serif' }}>
                NearPG
              </span>
            </Link>

            {/* Location selector pill */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-800 hover:text-blue-700 transition-all font-bold text-xs sm:text-sm"
              title="Select Location"
            >
              <MapPin size={13} className="text-blue-600 shrink-0" />
              <span className="max-w-[90px] sm:max-w-[140px] truncate">
                {userLoc.cityName || userLoc.stateName || 'Select Location'}
              </span>
              <ChevronDown size={13} className="text-slate-400 shrink-0" />
            </button>
          </div>

          {/* ── Center Nav + Search (desktop) ── */}
          <div className="hidden md:flex items-center gap-1 flex-1 max-w-xl mx-6">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                to={l.href}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(l.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <form onSubmit={handleSearch} className="flex-1 relative ml-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search city, area..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-blue-300 rounded-xl text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-blue-500/15"
              />
            </form>
          </div>

          {/* ── Right Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              to="/wishlist"
              className="hidden sm:flex p-2 sm:px-4 sm:py-2 items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-semibold text-sm"
            >
              <Heart size={18} strokeWidth={2} />
              <span className="hidden sm:block">Saved</span>
            </Link>

            {isAuthenticated ? (
              /* Logged-in dropdown */
              <div className="relative" ref={menuRef}>
                <button
                  id="header-user-menu-btn"
                  onClick={() => setMenuOpen(o => !o)}
                  className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white text-[11px] sm:text-xs font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}
                  >
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 hidden sm:block max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] ?? 'Account'}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform hidden sm:block ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
                      style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.12)' }}
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-violet-50">
                        <p className="font-bold text-slate-900 text-sm truncate">{profile?.full_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">+91 {profile?.phone_number}</p>
                      </div>

                      <div className="py-1.5">
                        {[
                          { to: '/profile',  icon: User,         label: 'My Profile' },
                          { to: '/bookings', icon: CalendarClock, label: 'My Bookings' },
                          { to: '/wishlist', icon: Heart,         label: 'Saved Properties' },
                          { to: '/settings', icon: Settings,      label: 'Settings' },
                          { to: '/admin',    icon: PlusCircle,   label: 'Add PG (Admin)' },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition-colors"
                          >
                            <Icon size={15} className="text-slate-400" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 py-1.5">
                        <button
                          id="header-logout-btn"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                  Log in
                </Link>
                <Link
                  to="/signup"
                  id="header-signup-btn"
                  className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2"
                >
                  <UserCircle2 size={15} className="shrink-0" />
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search ── */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search city, area, landmark..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-transparent focus:border-blue-300 transition-all"
            />
          </form>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 z-[55] md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-[60] md:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <span className="font-black text-lg text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>NearPG</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {isAuthenticated && (
                  <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                        style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)' }}>
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{profile?.full_name}</p>
                        <p className="text-xs text-slate-500">+91 {profile?.phone_number}</p>
                      </div>
                    </div>
                  </div>
                )}

                {NAV_LINKS.map(l => (
                  <Link key={l.href} to={l.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(l.href) ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                    }`}>
                    <l.icon size={18} className="text-slate-400" />
                    {l.label}
                  </Link>
                ))}

                <hr className="my-2 border-slate-100" />

                {isAuthenticated ? (
                  <>
                    {[
                      { to: '/profile',  icon: User,         label: 'My Profile' },
                      { to: '/bookings', icon: CalendarClock, label: 'My Bookings' },
                      { to: '/wishlist', icon: Heart,         label: 'Saved Properties' },
                      { to: '/settings', icon: Settings,      label: 'Settings' },
                      { to: '/admin',    icon: PlusCircle,   label: 'Add PG (Admin)' },
                    ].map(({ to, icon: Icon, label }) => (
                      <Link key={to} to={to}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                        <Icon size={18} className="text-slate-400" />
                        {label}
                      </Link>
                    ))}
                    <button onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors mt-2">
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link to="/login" className="block w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
                      Log in
                    </Link>
                    <Link to="/signup" className="block w-full text-center btn-primary text-sm">
                      Create Account
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Selector Modal */}
      <LocationSelectorModal />
    </>
  )
}
