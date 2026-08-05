import { supabase } from '../lib/supabase'

export interface State {
  id: string
  name: string
}

export interface City {
  id: string
  state_id: string
  name: string
}

export interface Area {
  id: string
  city_id: string
  name: string
}

export const locationService = {
  async getStates(): Promise<State[]> {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },

  async getCities(stateId: string): Promise<City[]> {
    if (!stateId) return []
    const { data, error } = await supabase
      .from('cities')
      .select('id, state_id, name')
      .eq('state_id', stateId)
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },

  async getAreas(cityId: string, onlyWithListings = true): Promise<Area[]> {
    if (!cityId) return []

    if (onlyWithListings) {
      // Fetch only areas that have available listings
      // We perform an inner join filter using pg_listings!inner
      const { data, error } = await supabase
        .from('areas')
        .select('id, city_id, name, pg_listings!inner(id, status)')
        .eq('city_id', cityId)
        .eq('pg_listings.status', 'Available')
        .order('name', { ascending: true })

      // Standard join fallback: if table relationship isn't mapped, try normal query
      if (error) {
        console.warn('Falling back to client-side area filtering due to:', error.message)
        return this.getAreasFallback(cityId)
      }

      return data || []
    } else {
      const { data, error } = await supabase
        .from('areas')
        .select('id, city_id, name')
        .eq('city_id', cityId)
        .order('name', { ascending: true })

      if (error) throw new Error(error.message)
      return data || []
    }
  },

  async getAreasFallback(cityId: string): Promise<Area[]> {
    // Fallback: Fetch all areas for the city, and then filter by checking pg_listings directly
    const { data: allAreas, error: areasError } = await supabase
      .from('areas')
      .select('id, city_id, name')
      .eq('city_id', cityId)
      .order('name', { ascending: true })

    if (areasError) throw new Error(areasError.message)
    if (!allAreas || allAreas.length === 0) return []

    // Fetch all available pg_listings in this city to get active area_ids
    const { data: listings, error: listingsError } = await supabase
      .from('pg_listings')
      .select('area_id')
      .eq('city_id', cityId)
      .eq('status', 'Available')

    if (listingsError) {
      // If listing has no area_id columns yet (pre-migration), return all areas
      return allAreas
    }

    const activeAreaIds = new Set(listings?.map(l => l.area_id).filter(Boolean))
    return allAreas.filter(area => activeAreaIds.has(area.id))
  }
}
