import { useStates, useCities, useAreas } from '../../hooks/useLocations'
import SearchableSelect from './SearchableSelect'
import { AlertCircle } from 'lucide-react'

interface LocationSelectorGroupProps {
  stateId: string
  cityId: string
  areaId: string
  onStateChange: (id: string, name: string) => void
  onCityChange: (id: string, name: string) => void
  onAreaChange: (id: string, name: string) => void
  horizontal?: boolean
  onlyWithListings?: boolean
}

export default function LocationSelectorGroup({
  stateId,
  cityId,
  areaId,
  onStateChange,
  onCityChange,
  onAreaChange,
  horizontal = false,
  onlyWithListings = true,
}: LocationSelectorGroupProps) {
  const { data: states = [], isLoading: isLoadingStates } = useStates()
  const { data: cities = [], isLoading: isLoadingCities } = useCities(stateId)
  const { data: areas = [], isLoading: isLoadingAreas } = useAreas(cityId, onlyWithListings)

  const handleStateChange = (id: string, name: string) => {
    onStateChange(id, name)
    onCityChange('', '')
    onAreaChange('', '')
  }

  const handleCityChange = (id: string, name: string) => {
    onCityChange(id, name)
    onAreaChange('', '')
  }

  const showNoAreasWarning = !!(cityId && !isLoadingAreas && areas.length === 0)

  return (
    <div className={`w-full ${horizontal ? 'flex flex-col sm:flex-row gap-2.5 sm:gap-4' : 'space-y-3 sm:space-y-4'}`}>
      {/* State Dropdown */}
      <div className="flex-1">
        <SearchableSelect
          id="location-state-select"
          label="State"
          placeholder="Select State"
          options={states}
          value={stateId}
          onChange={handleStateChange}
          isLoading={isLoadingStates}
          required
        />
      </div>

      {/* City Dropdown */}
      <div className="flex-1">
        <SearchableSelect
          id="location-city-select"
          label="City"
          placeholder={stateId ? 'Select City' : 'Choose a State first'}
          options={cities}
          value={cityId}
          onChange={handleCityChange}
          disabled={!stateId}
          isLoading={isLoadingCities}
          required
        />
      </div>

      {/* Area Dropdown */}
      <div className="flex-1">
        <SearchableSelect
          id="location-area-select"
          label="Area / Locality"
          placeholder={
            cityId
              ? showNoAreasWarning
                ? 'No areas available'
                : 'Select Area'
              : 'Choose a City first'
          }
          options={areas}
          value={areaId}
          onChange={onAreaChange}
          disabled={!cityId || showNoAreasWarning}
          isLoading={isLoadingAreas}
          required
        />

        {showNoAreasWarning && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200/50 p-2 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>No PGs available in this city.</span>
          </div>
        )}
      </div>
    </div>
  )
}
