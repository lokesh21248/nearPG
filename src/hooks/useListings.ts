import { useQuery } from '@tanstack/react-query'
import { listingsService, SearchParams } from '../services/listings.service'

export function useFeaturedListings() {
  return useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => listingsService.getFeatured()
  })
}

export function useRecentListings() {
  return useQuery({
    queryKey: ['listings', 'recent'],
    queryFn: () => listingsService.getRecent()
  })
}

export function useSearchListings(params: SearchParams) {
  return useQuery({
    queryKey: ['listings', 'search', params],
    queryFn: () => listingsService.search(params)
  })
}
