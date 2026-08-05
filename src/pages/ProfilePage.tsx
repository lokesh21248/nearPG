import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { profileService } from '../services/auth.service'
import { useToast } from '../components/ui/Toast'
import { LogOut, Heart, CalendarClock, Settings, ChevronRight, Phone, User, Pencil, Check, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMyBookings } from '../hooks/useBookings'
import { useWishlistIds } from '../hooks/useWishlist'

export default function ProfilePage() {
  const { firebaseUser, profile, signOut, refreshProfile } = useFirebaseAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: bookings = [] } = useMyBookings()
  const { data: wishlistIds = [] } = useWishlistIds()

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.full_name ?? '')
  const [isSavingName, setIsSavingName] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleEditName = () => {
    setNameInput(profile?.full_name ?? '')
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    const trimmed = nameInput.trim()
    if (trimmed.length < 3) {
      showToast('Name must be at least 3 characters.', 'error')
      return
    }
    if (!firebaseUser) return
    setIsSavingName(true)
    try {
      await profileService.updateName(firebaseUser.uid, trimmed)
      await refreshProfile()
      setIsEditingName(false)
      showToast('Name updated successfully!', 'success')
    } catch {
      showToast('Failed to update name. Please try again.', 'error')
    } finally {
      setIsSavingName(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setNameInput(profile?.full_name ?? '')
  }

  const initials = profile?.full_name
    ? profile.full_name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const menuItems = [
    { label: 'My Bookings', icon: CalendarClock, path: '/bookings', count: bookings.length },
    { label: 'Saved Properties', icon: Heart, path: '/wishlist', count: wishlistIds.length },
    { label: 'Settings', icon: Settings, path: '/settings', count: undefined },
  ]

  return (
    <PageWrapper>
      <Helmet>
        <title>My Profile | NearPG</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg shrink-0">
              {initials}
            </div>

            <div className="flex-1 w-full text-center sm:text-left">
              {/* Name (editable) */}
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                  <User size={11} /> Full Name
                </p>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="profile-name-input"
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-indigo-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-lg"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') handleCancelEdit() }}
                    />
                    <button
                      id="profile-save-name-btn"
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isSavingName
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Check size={16} />}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name ?? '—'}</h2>
                    <button
                      id="profile-edit-name-btn"
                      onClick={handleEditName}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit name"
                    >
                      <Pencil size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Phone (read-only) */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Phone size={11} /> Phone Number
                </p>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <p className="text-base font-semibold text-slate-700">
                    +91 {profile?.phone_number ?? '—'}
                  </p>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Phone number cannot be changed.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm mb-6">
          <div className="divide-y divide-slate-100">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.count !== undefined && (
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sign Out */}
        <button
          id="profile-logout-btn"
          onClick={handleSignOut}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </PageWrapper>
  )
}
