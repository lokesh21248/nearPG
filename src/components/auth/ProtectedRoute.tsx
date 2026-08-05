import { Navigate, useLocation } from 'react-router-dom'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Guards a route: if the user is not authenticated, redirects to /login
 * and stores the attempted path so we can redirect back after login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useFirebaseAuth()
  const location = useLocation()

  // Still resolving Firebase auth state — render nothing to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
