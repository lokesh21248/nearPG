import { useQuery } from '@tanstack/react-query'
import { listingsService } from '../services/listings.service'

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsService.getById(id),
    enabled: !!id,
  })
}
