export type BookingStatus = 'Pending' | 'Confirmed' | 'Rejected' | 'Cancelled'

export interface Booking {
  id: string
  pg_id: string
  user_id: string | null
  user_name: string
  phone: string
  email: string | null
  visit_date: string // YYYY-MM-DD
  visit_time: string
  message: string | null
  status: BookingStatus
  created_at: string
  
  // Joined relation (optional, if fetched)
  pg_listings?: {
    name: string
    city: string
    area: string
    pg_images: { image_url: string }[]
  }
}

export interface Review {
  id: string
  pg_id: string
  user_id: string
  user_name: string
  rating: number
  comment: string | null
  created_at: string
}

export interface WishlistItem {
  id: string
  pg_id: string
  user_id: string
  created_at: string
  
  // Joined relation
  pg_listings?: {
    id: string
    name: string
    gender: string
    city: string
    area: string
    status: string
    featured: boolean
    verified: boolean
    pg_images: { image_url: string }[]
    pg_rooms: { price: number }[]
  }
}
