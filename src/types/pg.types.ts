export type Gender = 'Men' | 'Women' | 'Coliving'
export type PGStatus = 'Available' | 'Almost Full' | 'Fully Occupied' | 'Inactive'
export type SharingType = 'Single Sharing' | '2 Sharing' | '3 Sharing' | '4 Sharing' | '5 Sharing' | '6 Sharing'
export type ACType = 'AC' | 'Non AC'

export interface PGLite {
  id: string
  name: string
  gender: Gender
  city: string
  area: string
  status: PGStatus
  featured: boolean
  verified: boolean
  pg_images: { image_url: string }[]
  pg_rooms: { price: number }[]
  created_at: string
  pg_amenities?: { amenity_name: string }[]
}

export interface PGRoom {
  id: string
  pg_id: string
  sharing_type: SharingType
  ac_type: ACType
  price: number
  security_deposit: number
  total_beds: number
  available_beds: number
  room_size: string | null
  created_at: string
}

export interface PGImage {
  id: string
  pg_id: string
  image_url: string
  display_order: number
  created_at: string
}

export interface PGAmenity {
  id: string
  pg_id: string
  amenity_name: string
  created_at: string
}

export interface PGDetail {
  id: string
  name: string
  gender: Gender
  city: string
  area: string
  address: string
  description: string
  owner_phone: string
  reception_phone: string | null
  whatsapp_number: string | null
  state: string | null
  google_map_link: string | null
  latitude: number | null
  longitude: number | null
  status: PGStatus
  featured: boolean
  verified: boolean
  couples_allowed: boolean
  bachelor_friendly: boolean
  created_at: string
  pg_images: PGImage[]
  pg_rooms: PGRoom[]
  pg_amenities: PGAmenity[]
}
