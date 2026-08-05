import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { GeoLocationState, reverseGeocode } from '../lib/geo'
import { supabase } from '../lib/supabase'

const LOCAL_STORAGE_LOCATION_KEY = 'nearpg_user_location'
const LOCAL_STORAGE_RECENTS_KEY  = 'nearpg_recent_searches'

export interface RecentSearchItem {
  id: string
  name: string
  subtitle?: string
  type: 'city' | 'area' | 'state'
  stateId: string
  cityId?: string
  areaId?: string
  stateName: string
  cityName?: string
  areaName?: string
  timestamp: number
}

const defaultLocationState: GeoLocationState = {
  latitude: null,
  longitude: null,
  stateId: '',
  cityId: '',
  areaId: '',
  stateName: '',
  cityName: '',
  areaName: '',
  radius: 10,
  detectionType: 'none',
}

interface LocationContextType {
  location: GeoLocationState
  isDetecting: boolean
  detectionError: string | null
  recentSearches: RecentSearchItem[]
  detectCurrentLocation: () => Promise<boolean>
  selectLocation: (details: {
    stateId: string
    cityId?: string
    areaId?: string
    stateName: string
    cityName?: string
    areaName?: string
    latitude?: number | null
    longitude?: number | null
    source?: 'manual' | 'gps' | 'url'
  }) => void
  setRadius: (radius: number) => void
  clearLocation: () => void
  addRecentSearch: (item: Omit<RecentSearchItem, 'timestamp'>) => void
  removeRecentSearch: (id: string) => void
  clearRecentSearches: () => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  // 1. Initial Location State from Local Storage
  const [location, setLocation] = useState<GeoLocationState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_LOCATION_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to parse location from localStorage', e)
    }
    return defaultLocationState
  })

  // 2. Recent Searches from Local Storage
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_RECENTS_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to parse recent searches from localStorage', e)
    }
    return [
      { id: 'hyd', name: 'Hyderabad', subtitle: 'Telangana', type: 'city', stateId: '', cityName: 'Hyderabad', stateName: 'Telangana', timestamp: Date.now() },
      { id: 'kphb', name: 'KPHB', subtitle: 'Hyderabad, Telangana', type: 'area', stateId: '', cityName: 'Hyderabad', areaName: 'KPHB', stateName: 'Telangana', timestamp: Date.now() - 1000 },
      { id: 'madhapur', name: 'Madhapur', subtitle: 'Hyderabad, Telangana', type: 'area', stateId: '', cityName: 'Hyderabad', areaName: 'Madhapur', stateName: 'Telangana', timestamp: Date.now() - 2000 },
    ]
  })

  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync location to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LOCATION_KEY, JSON.stringify(location))
    } catch (e) {
      console.error('Failed to save location to localStorage', e)
    }
  }, [location])

  // Sync recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RECENTS_KEY, JSON.stringify(recentSearches))
    } catch (e) {
      console.error('Failed to save recent searches to localStorage', e)
    }
  }, [recentSearches])

  // Add Recent Search (max 5 items, deduplicated)
  const addRecentSearch = useCallback((item: Omit<RecentSearchItem, 'timestamp'>) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => r.name.toLowerCase() !== item.name.toLowerCase())
      const newItem: RecentSearchItem = { ...item, timestamp: Date.now() }
      return [newItem, ...filtered].slice(0, 5)
    })
  }, [])

  const removeRecentSearch = useCallback((id: string) => {
    setRecentSearches((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
  }, [])

  // Detect GPS location
  const detectCurrentLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setDetectionError('Geolocation is not supported by your browser.')
      return false
    }

    setIsDetecting(true)
    setDetectionError(null)

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Reverse geocode
          const geoData = await reverseGeocode(lat, lng)

          let stateId = ''
          let cityId = ''
          let areaId = ''
          let stateName = geoData.state || ''
          let cityName = geoData.city || ''
          let areaName = geoData.area || ''

          // Match in Supabase
          if (stateName) {
            const { data: matchedState } = await supabase
              .from('states')
              .select('id, name')
              .ilike('name', `%${stateName}%`)
              .limit(1)
              .maybeSingle()

            if (matchedState) {
              stateId = matchedState.id
              stateName = matchedState.name

              if (cityName) {
                const { data: matchedCity } = await supabase
                  .from('cities')
                  .select('id, name')
                  .eq('state_id', stateId)
                  .ilike('name', `%${cityName}%`)
                  .limit(1)
                  .maybeSingle()

                if (matchedCity) {
                  cityId = matchedCity.id
                  cityName = matchedCity.name

                  if (areaName) {
                    const { data: matchedArea } = await supabase
                      .from('areas')
                      .select('id, name')
                      .eq('city_id', cityId)
                      .ilike('name', `%${areaName}%`)
                      .limit(1)
                      .maybeSingle()

                    if (matchedArea) {
                      areaId = matchedArea.id
                      areaName = matchedArea.name
                    }
                  }
                }
              }
            }
          }

          const newState: GeoLocationState = {
            latitude: lat,
            longitude: lng,
            stateId,
            cityId,
            areaId,
            stateName: stateName || 'Current Region',
            cityName: cityName || 'Nearby',
            areaName: areaName || '',
            radius: location.radius || 10,
            detectionType: 'gps',
          }

          setLocation(newState)
          setIsDetecting(false)
          setIsModalOpen(false)

          // Add to recent search
          if (cityName) {
            addRecentSearch({
              id: cityId || `gps-${Date.now()}`,
              name: cityName,
              subtitle: stateName,
              type: 'city',
              stateId,
              cityId,
              stateName,
              cityName,
            })
          }

          resolve(true)
        },
        (error) => {
          console.warn('Geolocation error:', error)
          let errMsg = 'Location permission denied or unavailable.'
          if (error.code === error.PERMISSION_DENIED) {
            errMsg = 'Location permission denied. Please select your city manually.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errMsg = 'Position unavailable. Please select your location manually.'
          } else if (error.code === error.TIMEOUT) {
            errMsg = 'Location request timed out.'
          }

          setDetectionError(errMsg)
          setIsDetecting(false)
          resolve(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      )
    })
  }, [location.radius, addRecentSearch])

  // Select location manually or from URL
  const selectLocation = useCallback(
    (details: {
      stateId: string
      cityId?: string
      areaId?: string
      stateName: string
      cityName?: string
      areaName?: string
      latitude?: number | null
      longitude?: number | null
      source?: 'manual' | 'gps' | 'url'
    }) => {
      setLocation((prev) => ({
        ...prev,
        stateId: details.stateId,
        cityId: details.cityId || '',
        areaId: details.areaId || '',
        stateName: details.stateName,
        cityName: details.cityName || '',
        areaName: details.areaName || '',
        latitude: details.latitude !== undefined ? details.latitude : prev.latitude,
        longitude: details.longitude !== undefined ? details.longitude : prev.longitude,
        detectionType: details.source || 'manual',
      }))

      setDetectionError(null)
      setIsModalOpen(false)

      // Add to recent searches if city or area selected
      const name = details.areaName || details.cityName || details.stateName
      if (name) {
        addRecentSearch({
          id: details.areaId || details.cityId || details.stateId || `loc-${Date.now()}`,
          name,
          subtitle: details.areaName
            ? `${details.cityName}, ${details.stateName}`
            : details.cityName
            ? details.stateName
            : 'State',
          type: details.areaName ? 'area' : details.cityName ? 'city' : 'state',
          stateId: details.stateId,
          cityId: details.cityId,
          areaId: details.areaId,
          stateName: details.stateName,
          cityName: details.cityName,
          areaName: details.areaName,
        })
      }
    },
    [addRecentSearch]
  )

  const setRadius = useCallback((radius: number) => {
    setLocation((prev) => ({ ...prev, radius }))
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(defaultLocationState)
    localStorage.removeItem(LOCAL_STORAGE_LOCATION_KEY)
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        detectionError,
        recentSearches,
        detectCurrentLocation,
        selectLocation,
        setRadius,
        clearLocation,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useUserLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider')
  }
  return context
}
