import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsService } from '../services/bookings.service'
import { useFirebaseAuth } from './useFirebaseAuth'

export function useMyBookings() {
  const { firebaseUser } = useFirebaseAuth()
  return useQuery({
    queryKey: ['bookings', firebaseUser?.uid],
    queryFn: () => bookingsService.getMyBookings(firebaseUser!.uid),
    enabled: !!firebaseUser?.uid,
  })
}

export function useCreateBooking() {
  const { firebaseUser } = useFirebaseAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (booking: Parameters<typeof bookingsService.createBooking>[0]) =>
      bookingsService.createBooking({ ...booking, user_id: firebaseUser?.uid ?? null }),
    onSuccess: () => {
      if (firebaseUser?.uid) {
        queryClient.invalidateQueries({ queryKey: ['bookings', firebaseUser.uid] })
      }
    },
  })
}

export function useCancelBooking() {
  const { firebaseUser } = useFirebaseAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingsService.cancelBooking(id),
    onSuccess: () => {
      if (firebaseUser?.uid) {
        queryClient.invalidateQueries({ queryKey: ['bookings', firebaseUser.uid] })
      }
    },
  })
}
