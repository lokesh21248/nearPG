import { supabase } from '../lib/supabase'
import type { PGDetail, PGLite } from '../types/pg.types'

export interface SearchParams {
  state_id?: string
  city_id?: string
  area_id?: string
  city?: string
  area?: string
  gender?: string
  min_price?: string
  max_price?: string
  amenities?: string[]
  sharing?: string[]
  ac?: string
  sort?: string
  available_only?: boolean | string
}

export const listingsService = {
  async getFeatured(): Promise<PGLite[]> {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('id, name, gender, city, area, status, featured, verified, created_at, pg_images(image_url), pg_rooms(price)')
      .eq('featured', true)
      .eq('status', 'Available')
      .order('created_at', { ascending: false })
      .limit(6)
    
    if (error) throw new Error(error.message)
    return data as PGLite[]
  },

  async getRecent(): Promise<PGLite[]> {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('id, name, gender, city, area, status, featured, verified, created_at, pg_images(image_url), pg_rooms(price)')
      .eq('status', 'Available')
      .order('created_at', { ascending: false })
      .limit(6)
    
    if (error) throw new Error(error.message)
    return data as PGLite[]
  },

  async getById(id: string): Promise<PGDetail> {
    const { data, error } = await supabase
      .from('pg_listings')
      .select('*, pg_images(*), pg_rooms(*), pg_amenities(*)')
      .eq('id', id)
      .single()
      
    if (error) throw new Error(error.message)
    return data as PGDetail
  },

  async search(params: SearchParams): Promise<PGLite[]> {
    let query = supabase
      .from('pg_listings')
      .select('id, name, gender, city, area, status, featured, verified, created_at, pg_images(image_url), pg_rooms(price), pg_amenities(amenity_name)')

    // Base filters
    if (params.state_id) query = query.eq('state_id', params.state_id)
    if (params.city_id) query = query.eq('city_id', params.city_id)
    if (params.area_id) query = query.eq('area_id', params.area_id)
    if (params.city && !params.city_id) query = query.ilike('city', `%${params.city}%`)
    if (params.area && !params.area_id) query = query.ilike('area', `%${params.area}%`)
    if (params.gender) query = query.eq('gender', params.gender)
    
    // Status filter
    if (params.available_only === true || params.available_only === 'true') {
      query = query.eq('status', 'Available')
    }
    
    // Sort logic
    if (params.sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false }) // default
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    
    let results = data as any[]

    // In-memory filters for nested relationships (Supabase RPC would be better for pure SQL, but this works for scale MVP)
    if (params.min_price || params.max_price || (params.sharing && params.sharing.length > 0) || params.ac) {
      results = results.filter(pg => {
        const rooms = pg.pg_rooms || []
        if (rooms.length === 0) return false

        // Check if ANY room satisfies the room filters
        return rooms.some((room: any) => {
          let match = true
          if (params.min_price && room.price < Number(params.min_price)) match = false
          if (params.max_price && room.price > Number(params.max_price)) match = false
          if (params.ac && room.ac_type !== params.ac) match = false
          if (params.sharing && params.sharing.length > 0) {
            // "2 Sharing", "Single Sharing" etc.
            if (!params.sharing.includes(room.sharing_type)) match = false
          }
          return match
        })
      })
    }

    // Amenities filter (must have ALL requested amenities)
    if (params.amenities && params.amenities.length > 0) {
      results = results.filter(pg => {
        const ams = (pg.pg_amenities || []).map((a: any) => a.amenity_name)
        return params.amenities!.every(a => ams.includes(a))
      })
    }

    // Sort by price if requested (requires in-memory sort after room filtering)
    if (params.sort === 'price_asc') {
      results.sort((a, b) => {
        const aMin = Math.min(...a.pg_rooms.map((r: any) => r.price))
        const bMin = Math.min(...b.pg_rooms.map((r: any) => r.price))
        return aMin - bMin
      })
    } else if (params.sort === 'price_desc') {
      results.sort((a, b) => {
        const aMax = Math.max(...a.pg_rooms.map((r: any) => r.price))
        const bMax = Math.max(...b.pg_rooms.map((r: any) => r.price))
        return bMax - aMax
      })
    }

    return results as PGLite[]
  }
}
