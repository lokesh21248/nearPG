import { supabase } from '../lib/supabase'

export interface State {
  id: string
  name: string
  slug?: string
}

export interface City {
  id: string
  state_id: string
  name: string
  slug?: string
  latitude?: number
  longitude?: number
  pg_count?: number
}

export interface Area {
  id: string
  city_id: string
  name: string
  slug?: string
  latitude?: number
  longitude?: number
  pg_count?: number
}

export interface PopularCity {
  id: string
  name: string
  stateName?: string
  stateId?: string
  slug?: string
  pgCount: number
  icon?: string
  imageUrl?: string
}

export interface StateWithCities extends State {
  cities: City[]
}

export interface LocationSearchResult {
  id: string
  type: 'city' | 'state' | 'area' | 'landmark'
  title: string
  subtitle: string
  stateId: string
  cityId?: string
  areaId?: string
  stateName: string
  cityName?: string
  areaName?: string
  slug?: string
  score?: number
}

// Helper to create URL friendly slug from name
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/-\-+/g, '-')
}

export const locationService = {
  async getStates(): Promise<State[]> {
    const { data, error } = await supabase
      .from('states')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []).map(s => ({ ...s, slug: slugify(s.name) }))
  },

  async getCities(stateId?: string): Promise<City[]> {
    let query = supabase.from('cities').select('id, state_id, name')
    if (stateId) {
      query = query.eq('state_id', stateId)
    }
    const { data, error } = await query.order('name', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []).map(c => ({ ...c, slug: slugify(c.name) }))
  },

  async getAreas(cityId: string, onlyWithListings = false): Promise<Area[]> {
    if (!cityId) return []

    if (onlyWithListings) {
      const { data, error } = await supabase
        .from('areas')
        .select('id, city_id, name, pg_listings!inner(id, status)')
        .eq('city_id', cityId)
        .eq('pg_listings.status', 'Available')
        .order('name', { ascending: true })

      if (error) {
        return this.getAreasFallback(cityId)
      }
      return (data || []).map(a => ({ ...a, slug: slugify(a.name) }))
    } else {
      const { data, error } = await supabase
        .from('areas')
        .select('id, city_id, name')
        .eq('city_id', cityId)
        .order('name', { ascending: true })

      if (error) throw new Error(error.message)
      return (data || []).map(a => ({ ...a, slug: slugify(a.name) }))
    }
  },

  async getAreasFallback(cityId: string): Promise<Area[]> {
    const { data: allAreas, error: areasError } = await supabase
      .from('areas')
      .select('id, city_id, name')
      .eq('city_id', cityId)
      .order('name', { ascending: true })

    if (areasError) throw new Error(areasError.message)
    if (!allAreas || allAreas.length === 0) return []

    const { data: listings, error: listingsError } = await supabase
      .from('pg_listings')
      .select('area_id')
      .eq('city_id', cityId)
      .eq('status', 'Available')

    if (listingsError) {
      return allAreas.map(a => ({ ...a, slug: slugify(a.name) }))
    }

    const activeAreaIds = new Set(listings?.map(l => l.area_id).filter(Boolean))
    return allAreas
      .filter(area => activeAreaIds.has(area.id))
      .map(a => ({ ...a, slug: slugify(a.name) }))
  },

  /**
   * Fetch Popular Cities sorted by PG count
   */
  async getPopularCities(): Promise<PopularCity[]> {
    try {
      // 1. Fetch cities with states and image_url
      const { data: cities, error: citiesErr } = await supabase
        .from('cities')
        .select('id, state_id, name, image_url, states(name)')
        .order('name', { ascending: true })

      if (citiesErr || !cities) {
        throw new Error(citiesErr?.message || 'Failed to load cities')
      }

      // 2. Fetch PG counts per city from pg_listings
      const { data: listings } = await supabase
        .from('pg_listings')
        .select('city_id')
        .eq('status', 'Available')

      const countMap: Record<string, number> = {}
      listings?.forEach(l => {
        if (l.city_id) countMap[l.city_id] = (countMap[l.city_id] || 0) + 1
      })

      const cityIcons: Record<string, string> = {
        hyderabad: '🕌',
        bangalore: '🌳',
        chennai: '🌊',
        pune: '⛰️',
        mumbai: '🌊',
        delhi: '🏛️',
        kolkata: '🌉',
      }

      const results: PopularCity[] = cities.map((c: any) => {
        const lowerName = c.name.toLowerCase()
        const rawCount = countMap[c.id] || 0
        return {
          id: c.id,
          name: c.name,
          stateId: c.state_id,
          stateName: c.states?.name || '',
          slug: slugify(c.name),
          pgCount: rawCount,
          icon: cityIcons[lowerName] || '🏙️',
          imageUrl: c.image_url
        }
      })

      // Sort by pgCount descending
      return results.sort((a, b) => b.pgCount - a.pgCount)
    } catch (e) {
      console.warn('Error fetching popular cities:', e)
      return []
    }
  },

  /**
   * Browse by State: Fetch all states along with their associated cities
   */
  async getStatesWithCities(): Promise<StateWithCities[]> {
    try {
      const { data: states, error: statesErr } = await supabase
        .from('states')
        .select('id, name')
        .order('name', { ascending: true })

      if (statesErr || !states) return []

      const { data: cities, error: citiesErr } = await supabase
        .from('cities')
        .select('id, state_id, name')
        .order('name', { ascending: true })

      if (citiesErr) return states.map(s => ({ ...s, slug: slugify(s.name), cities: [] }))

      return states.map(s => ({
        ...s,
        slug: slugify(s.name),
        cities: (cities || [])
          .filter(c => c.state_id === s.id)
          .map(c => ({ ...c, slug: slugify(c.name) })),
      }))
    } catch (e) {
      console.error('Failed to load states with cities:', e)
      return []
    }
  },

  /**
   * Smart Multi-Entity Search (States, Cities, Areas, Landmarks) with ranking
   */
  async searchLocations(query: string): Promise<LocationSearchResult[]> {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const results: LocationSearchResult[] = []

    try {
      // 1. Search Cities (join with States)
      const { data: cities } = await supabase
        .from('cities')
        .select('id, state_id, name, states(id, name)')

      if (cities) {
        cities.forEach((c: any) => {
          const name = c.name.toLowerCase()
          const stateName = c.states?.name || ''
          let score = -1

          if (name === q) score = 100
          else if (name.startsWith(q)) score = 80
          else if (name.includes(q)) score = 50

          if (score > 0) {
            results.push({
              id: c.id,
              type: 'city',
              title: c.name,
              subtitle: stateName,
              stateId: c.state_id,
              cityId: c.id,
              stateName,
              cityName: c.name,
              slug: slugify(c.name),
              score,
            })
          }
        })
      }

      // 2. Search States
      const { data: states } = await supabase
        .from('states')
        .select('id, name')

      if (states) {
        states.forEach((s: any) => {
          const name = s.name.toLowerCase()
          let score = -1

          if (name === q) score = 95
          else if (name.startsWith(q)) score = 75
          else if (name.includes(q)) score = 45

          if (score > 0) {
            results.push({
              id: s.id,
              type: 'state',
              title: s.name,
              subtitle: 'State in India',
              stateId: s.id,
              stateName: s.name,
              slug: slugify(s.name),
              score,
            })
          }
        })
      }

      // 3. Search Areas (join with Cities and States)
      const { data: areas } = await supabase
        .from('areas')
        .select('id, city_id, name, cities(id, name, state_id, states(id, name))')

      if (areas) {
        areas.forEach((a: any) => {
          const name = a.name.toLowerCase()
          const cityName = a.cities?.name || ''
          const stateName = a.cities?.states?.name || ''
          let score = -1

          if (name === q) score = 90
          else if (name.startsWith(q)) score = 70
          else if (name.includes(q)) score = 40

          if (score > 0) {
            results.push({
              id: a.id,
              type: 'area',
              title: a.name,
              subtitle: `${cityName}, ${stateName}`,
              stateId: a.cities?.state_id || '',
              cityId: a.city_id,
              areaId: a.id,
              stateName,
              cityName,
              areaName: a.name,
              slug: slugify(a.name),
              score,
            })
          }
        })
      }
    } catch (e) {
      console.warn('Search query error:', e)
    }

    // Sort by score descending
    return results.sort((a, b) => (b.score || 0) - (a.score || 0))
  },

  /**
   * Resolve location details by URL slugs
   */
  async getLocationBySlug(stateSlug: string, citySlug?: string, areaSlug?: string) {
    try {
      const states = await this.getStates()
      const state = states.find(s => s.slug === stateSlug)
      if (!state) return null

      let city: City | undefined
      let area: Area | undefined

      if (citySlug) {
        const cities = await this.getCities(state.id)
        city = cities.find(c => c.slug === citySlug)

        if (city && areaSlug) {
          const areas = await this.getAreas(city.id, false)
          area = areas.find(a => a.slug === areaSlug)
        }
      }

      return {
        stateId: state.id,
        stateName: state.name,
        cityId: city?.id || '',
        cityName: city?.name || '',
        areaId: area?.id || '',
        areaName: area?.name || '',
      }
    } catch (e) {
      console.error('Error resolving slug:', e)
      return null
    }
  }
}
