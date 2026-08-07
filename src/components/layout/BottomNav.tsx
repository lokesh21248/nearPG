import { Link, useLocation } from 'react-router-dom'
import { Home, Search, MapPin, Heart, UserCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'

export function BottomNav() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useFirebaseAuth()

  const tabs = [
    { name: 'Home',    path: '/',         icon: Home },
    { name: 'Search',  path: '/search',   icon: Search },
    { name: 'Map',     path: '/map',      icon: MapPin },
    { name: 'Saved',   path: '/wishlist', icon: Heart },
    { name: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: UserCircle2 },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/70 z-50 sm:hidden pb-[env(safe-area-inset-bottom,0px)]"
      style={{ boxShadow: '0 -8px 24px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(tab => {
          const isActive = tab.path === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.path)
          const Icon = tab.icon

          return (
            <Link
              key={tab.name}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                />
              </motion.div>
              <span className={`text-[10px] tracking-tight transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
