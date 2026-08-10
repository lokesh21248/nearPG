/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { signOut as firebaseSignOut, profileService } from '../services/auth.service'
import type { UserProfile } from '../types/auth.types'

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Firebase user object (null if not authenticated) */
  firebaseUser: User | null
  /** Supabase profile (null if not fetched yet or no profile) */
  profile: UserProfile | null
  /** True while initial auth state is resolving */
  isLoading: boolean
  /** True when Firebase user exists */
  isAuthenticated: boolean
  /** Refresh profile from Supabase (e.g. after name update) */
  refreshProfile: () => Promise<void>
  /** Sign out from Firebase and clear profile */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const data = await profileService.getProfile(user.uid)
      setProfile(data)
    } catch (err) {
      console.error('[AuthContext] Failed to fetch profile:', err)
      setProfile(null)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser)
    }
  }, [firebaseUser, fetchProfile])

  const signOut = useCallback(async () => {
    await firebaseSignOut()
    setFirebaseUser(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)

      if (user) {
        await fetchProfile(user)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [fetchProfile])

  const value: AuthContextValue = {
    firebaseUser,
    profile,
    isLoading,
    isAuthenticated: firebaseUser !== null,
    refreshProfile,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}
