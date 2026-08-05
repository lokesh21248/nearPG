import { supabase } from '../lib/supabase'
import type { Booking } from '../types/booking.types'

export const bookingsService = {
  async getMyBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('pg_bookings')
      .select('*, pg_listings(name, city, area, pg_images(image_url))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) throw new Error(error.message)
    return data as Booking[]
  },

  async createBooking(booking: Partial<Booking>): Promise<Booking> {
    const { data, error } = await supabase
      .from('pg_bookings')
      .insert(booking)
      .select()
      .single()
      
    if (error) throw new Error(error.message)
    return data as Booking
  },
  
  async cancelBooking(id: string): Promise<void> {
    const { error } = await supabase
      .from('pg_bookings')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      
    if (error) throw new Error(error.message)
  }
}
