import { supabase } from '../lib/supabase'
import type { WishlistItem } from '../types/booking.types'

export const wishlistService = {
  async getMyWishlist(userId: string): Promise<WishlistItem[]> {
    const { data, error } = await supabase
      .from('pg_wishlist')
      .select('*, pg_listings(id, name, gender, city, area, status, featured, verified, pg_images(image_url), pg_rooms(price))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) throw new Error(error.message)
    return data as WishlistItem[]
  },

  async getMyWishlistIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('pg_wishlist')
      .select('pg_id')
      .eq('user_id', userId)
      
    if (error) throw new Error(error.message)
    return data.map(w => w.pg_id)
  },

  async addToWishlist(pgId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pg_wishlist')
      .insert({ pg_id: pgId, user_id: userId })
      
    if (error) throw new Error(error.message)
  },

  async removeFromWishlist(pgId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pg_wishlist')
      .delete()
      .eq('pg_id', pgId)
      .eq('user_id', userId)
      
    if (error) throw new Error(error.message)
  }
}
