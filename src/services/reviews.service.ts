import { supabase } from '../lib/supabase'
import type { Review } from '../types/booking.types'

export const reviewsService = {
  async getByPgId(pgId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('pg_reviews')
      .select('*')
      .eq('pg_id', pgId)
      .order('created_at', { ascending: false })
      
    if (error) throw new Error(error.message)
    return data as Review[]
  },

  async getMyReviews(userId: string): Promise<Review[]> {
    const { data, error } = await supabase
      .from('pg_reviews')
      .select('*, pg_listings(name, city, area, pg_images(image_url))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      
    if (error) throw new Error(error.message)
    return data as Review[]
  },

  async addReview(review: Partial<Review>): Promise<Review> {
    const { data, error } = await supabase
      .from('pg_reviews')
      .insert(review)
      .select()
      .single()
      
    if (error) throw new Error(error.message)
    return data as Review
  },

  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('pg_reviews')
      .delete()
      .eq('id', id)
      
    if (error) throw new Error(error.message)
  }
}
