import { Link, useLocation } from 'react-router-dom'
import { Home, Search, MapPin, Heart, UserCircle2 } from 'lucide-react'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'

export function BottomNav() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useFirebaseAuth()

  const tabs = [
    { name: 'Home',    path: '/',        icon: Home },
    { name: 'Explore', path: '/search',  icon: Search },
    { name: 'Map',     path: '/map',     icon: MapPin },
    { name: 'Saved',   path: '/wishlist', icon: Heart },
    { name: 'Profile', path: isAuthenticated ? '/profile' : '/login', icon: UserCircle2 },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-50 sm:hidden pb-[env(safe-area-inset-bottom,0px)]"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const isActive = tab.path === '/'
            ? pathname === '/'
            : pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all duration-200 group relative"
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-blue-50 text-blue-600 scale-105' : 'text-slate-400 group-hover:bg-slate-100'
              }`}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
