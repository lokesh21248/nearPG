import { useQuery } from '@tanstack/react-query'
import { locationService } from '../services/location.service'

export function useStates() {
  return useQuery({
    queryKey: ['location', 'states'],
    queryFn: () => locationService.getStates(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  })
}

export function useCities(stateId: string) {
  return useQuery({
    queryKey: ['location', 'cities', stateId],
    queryFn: () => locationService.getCities(stateId),
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useAreas(cityId: string, onlyWithListings = true) {
  return useQuery({
    queryKey: ['location', 'areas', cityId, onlyWithListings],
    queryFn: () => locationService.getAreas(cityId, onlyWithListings),
    enabled: !!cityId,
    staleTime: 30 * 1000, // shorter stale time for dynamic listings mapping
    gcTime: 5 * 60 * 1000,
  })
}
