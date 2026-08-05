/**
 * Geolocation & Distance utilities using Haversine formula and Nominatim Reverse Geocoding
 */

export interface GeoLocationState {
  latitude: number | null
  longitude: number | null
  stateId: string
  cityId: string
  areaId: string
  stateName: string
  cityName: string
  areaName: string
  radius: number // in km (2, 5, 10, 20, 50)
  detectionType: 'gps' | 'manual' | 'url' | 'none'
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity

  const R = 6371 // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Formats distance in km to clean human-readable string (e.g. "250 m" or "1.2 km")
 */
export function formatDistance(distKm: number): string {
  if (distKm === Infinity || isNaN(distKm)) return ''
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`
  }
  return `${distKm.toFixed(1)} km`
}

/**
 * Reverse geocodes latitude & longitude into location details using Nominatim OpenStreetMap API
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{
  state: string
  city: string
  area: string
  pincode: string
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'NearPG-App/1.0',
        },
      }
    )
    if (!res.ok) throw new Error('Reverse geocoding failed')
    const data = await res.json()
    const addr = data.address || {}

    const state = addr.state || addr.region || ''
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.city_district ||
      addr.county ||
      addr.state_district ||
      ''
    const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || ''
    const pincode = addr.postcode || ''

    return { state, city, area, pincode }
  } catch (err) {
    console.warn('Reverse geocoding warning:', err)
    return { state: '', city: '', area: '', pincode: '' }
  }
}
