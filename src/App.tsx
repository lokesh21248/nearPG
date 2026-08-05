import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'
import { ToastProvider } from './components/ui/Toast'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Public pages
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import PGDetailPage from './pages/PGDetailPage'
import MapPage from './pages/MapPage'
import NotFoundPage from './pages/NotFoundPage'

// Auth pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Private pages
import ProfilePage from './pages/ProfilePage'
import WishlistPage from './pages/WishlistPage'
import BookingsPage from './pages/BookingsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LocationProvider>
              <ToastProvider>
                <Routes>
                  {/* ── Public ── */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/state/:stateSlug" element={<SearchPage />} />
                  <Route path="/state/:stateSlug/:citySlug" element={<SearchPage />} />
                  <Route path="/state/:stateSlug/:citySlug/:areaSlug" element={<SearchPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/pg/:id" element={<PGDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* ── Private ── */}
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

                {/* ── Fallback ── */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </LocationProvider>
        </AuthProvider>
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default App
