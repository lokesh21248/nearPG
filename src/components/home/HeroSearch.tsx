import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, ChevronDown, Crosshair, MapPin } from 'lucide-react'
import LocationSelectorGroup from '../ui/LocationSelectorGroup'
import { useUserLocation } from '../../contexts/LocationContext'

export function HeroSearch() {
  const navigate = useNavigate()
  const { detectCurrentLocation, isDetecting, location } = useUserLocation()
  const [stateId, setStateId] = useState('')
  const [cityId, setCityId]   = useState('')
  const [areaId, setAreaId]   = useState('')
  const [gender, setGender]   = useState('')
  const [onlyWithListings, setOnlyWithListings] = useState(false)
  const [validationError, setValidationError] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!stateId || !cityId || !areaId) {
      setValidationError('Please select State, City, and Area to search.')
      return
    }

    setValidationError('')
    const params = new URLSearchParams()
    params.set('state_id', stateId)
    params.set('city_id', cityId)
    params.set('area_id', areaId)
    if (gender) params.set('gender', gender)
    if (onlyWithListings) params.set('available_only', 'true')

    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="page-container py-8 sm:py-10">

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2"
            style={{ fontFamily: 'Outfit,sans-serif' }}>
            Find a PG that feels right.
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Search verified stays by location, budget and sharing type.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5">
          <form onSubmit={handleSearch} className="space-y-4">

            {/* Location row */}
            <LocationSelectorGroup
              stateId={stateId}
              cityId={cityId}
              areaId={areaId}
              onStateChange={(id) => { setStateId(id); setValidationError('') }}
              onCityChange={(id) => { setCityId(id); setValidationError('') }}
              onAreaChange={(id) => { setAreaId(id); setValidationError('') }}
              horizontal={true}
              onlyWithListings={onlyWithListings}
            />

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-slate-100">

              {/* Gender */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 w-full sm:w-auto">
                <Users size={15} className="text-slate-400 shrink-0" />
                <div className="flex-1 relative">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Gender</p>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-slate-800 appearance-none cursor-pointer pr-5"
                  >
                    <option value="">Any</option>
                    <option value="Men">Men Only</option>
                    <option value="Women">Women Only</option>
                    <option value="Coliving">Coliving</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Available Only toggle */}
              <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 select-none shrink-0">
                <input
                  type="checkbox"
                  checked={onlyWithListings}
                  onChange={(e) => setOnlyWithListings(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Available Only
              </label>

              {/* Detect location pill */}
              <button
                type="button"
                onClick={() => detectCurrentLocation()}
                disabled={isDetecting}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-blue-700 text-xs font-semibold transition-all shrink-0"
              >
                {isDetecting ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Crosshair size={13} className="text-blue-500" />
                )}
                {isDetecting ? 'Detecting…' : 'My Location'}
              </button>

              <div className="flex-1 sm:flex sm:justify-end items-center gap-2">
                {validationError && (
                  <span className="text-xs text-rose-500 font-semibold text-center sm:text-right block sm:inline mb-1 sm:mb-0">
                    {validationError}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={!stateId || !cityId || !areaId}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}
                >
                  <Search size={16} strokeWidth={2.5} />
                  Search PG
                </button>
              </div>
            </div>
          </form>

          {/* Location chip shown below form */}
          {location.cityName && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin size={11} className="text-blue-500 shrink-0" />
              <span>Showing results near <strong className="text-slate-700">{location.cityName}</strong></span>
              <button
                type="button"
                onClick={() => detectCurrentLocation()}
                disabled={isDetecting}
                className="sm:hidden ml-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <Crosshair size={11} />
                Detect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
