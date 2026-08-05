import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistService } from '../services/wishlist.service'
import { useFirebaseAuth } from './useFirebaseAuth'

export function useWishlist() {
  const { firebaseUser } = useFirebaseAuth()
  return useQuery({
    queryKey: ['wishlist', firebaseUser?.uid],
    queryFn: () => wishlistService.getMyWishlist(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useWishlistIds() {
  const { firebaseUser } = useFirebaseAuth()
  return useQuery({
    queryKey: ['wishlist', 'ids', firebaseUser?.uid],
    queryFn: () => wishlistService.getMyWishlistIds(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useToggleWishlist() {
  const { firebaseUser } = useFirebaseAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pgId, isWished }: { pgId: string; isWished: boolean }) => {
      if (!firebaseUser?.uid) throw new Error('Must be logged in')
      if (isWished) {
        await wishlistService.removeFromWishlist(pgId, firebaseUser.uid)
      } else {
        await wishlistService.addToWishlist(pgId, firebaseUser.uid)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', 'ids', firebaseUser?.uid] })
      queryClient.invalidateQueries({ queryKey: ['wishlist', firebaseUser?.uid] })
    },
  })
}
