import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { GeoLocationState, reverseGeocode } from '../lib/geo'
import { supabase } from '../lib/supabase'

const LOCAL_STORAGE_KEY = 'nearpg_user_location'

const defaultLocationState: GeoLocationState = {
  latitude: null,
  longitude: null,
  stateId: '',
  cityId: '',
  areaId: '',
  stateName: '',
  cityName: '',
  areaName: '',
  radius: 10, // default 10km
  detectionType: 'none',
}

interface LocationContextType {
  location: GeoLocationState
  isDetecting: boolean
  detectionError: string | null
  detectCurrentLocation: () => Promise<boolean>
  setLocationManually: (details: {
    stateId: string
    cityId: string
    areaId?: string
    stateName: string
    cityName: string
    areaName?: string
  }) => void
  setRadius: (radius: number) => void
  clearLocation: () => void
  isModalOpen: boolean
  setIsModalOpen: (open: boolean) => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<GeoLocationState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to parse location from localStorage', e)
    }
    return defaultLocationState
  })

  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionError, setDetectionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(location))
    } catch (e) {
      console.error('Failed to save location to localStorage', e)
    }
  }, [location])

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
          let stateName = geoData.state
          let cityName = geoData.city
          const areaName = geoData.area

          // Attempt matching state & city in Supabase
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
                }
              }
            }
          }

          const newState: GeoLocationState = {
            latitude: lat,
            longitude: lng,
            stateId,
            cityId,
            areaId: '',
            stateName: stateName || 'Current Region',
            cityName: cityName || 'Nearby',
            areaName: areaName || '',
            radius: location.radius || 10,
            detectionType: 'gps',
          }

          setLocation(newState)
          setIsDetecting(false)
          setIsModalOpen(false)
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
  }, [location.radius])

  // Set location manually
  const setLocationManually = useCallback(
    (details: {
      stateId: string
      cityId: string
      areaId?: string
      stateName: string
      cityName: string
      areaName?: string
    }) => {
      setLocation((prev) => ({
        ...prev,
        stateId: details.stateId,
        cityId: details.cityId,
        areaId: details.areaId || '',
        stateName: details.stateName,
        cityName: details.cityName,
        areaName: details.areaName || '',
        detectionType: 'manual',
      }))
      setDetectionError(null)
      setIsModalOpen(false)
    },
    []
  )

  // Change radius
  const setRadius = useCallback((radius: number) => {
    setLocation((prev) => ({ ...prev, radius }))
  }, [])

  // Clear location
  const clearLocation = useCallback(() => {
    setLocation(defaultLocationState)
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  }, [])

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        detectionError,
        detectCurrentLocation,
        setLocationManually,
        setRadius,
        clearLocation,
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
