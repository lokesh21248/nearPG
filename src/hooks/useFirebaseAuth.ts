import { useAuthContext } from '../contexts/AuthContext'

/**
 * Convenience hook for consuming auth state in any component.
 *
 * @example
 * const { isAuthenticated, profile, signOut } = useFirebaseAuth()
 */
export function useFirebaseAuth() {
  return useAuthContext()
}
