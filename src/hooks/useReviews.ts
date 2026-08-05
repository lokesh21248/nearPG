import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsService } from '../services/reviews.service'
import { useFirebaseAuth } from './useFirebaseAuth'

export function useReviews(pgId: string) {
  return useQuery({
    queryKey: ['reviews', pgId],
    queryFn: () => reviewsService.getByPgId(pgId),
    enabled: !!pgId,
  })
}

export function useMyReviews() {
  const { firebaseUser } = useFirebaseAuth()
  return useQuery({
    queryKey: ['reviews', 'user', firebaseUser?.uid],
    queryFn: () => reviewsService.getMyReviews(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useAddReview() {
  const { firebaseUser } = useFirebaseAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (review: Parameters<typeof reviewsService.addReview>[0]) =>
      reviewsService.addReview({ ...review, user_id: firebaseUser?.uid ?? '' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.pg_id] })
      if (firebaseUser?.uid) {
        queryClient.invalidateQueries({ queryKey: ['reviews', 'user', firebaseUser.uid] })
      }
    },
  })
}

export function useDeleteReview() {
  const { firebaseUser } = useFirebaseAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewsService.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}
