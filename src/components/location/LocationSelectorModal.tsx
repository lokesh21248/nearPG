import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, X, ChevronRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useUserLocation } from '../../contexts/LocationContext'
import LocationSelectorGroup from '../ui/LocationSelectorGroup'

export function LocationSelectorModal() {
  const {
    location,
    isModalOpen,
    setIsModalOpen,
    isDetecting,
    detectionError,
    detectCurrentLocation,
    setLocationManually,
  } = useUserLocation()

  const [stateId, setStateId] = useState(location.stateId)
  const [cityId, setCityId] = useState(location.cityId)
  const [areaId, setAreaId] = useState(location.areaId)
  const [stateName, setStateName] = useState(location.stateName)
  const [cityName, setCityName] = useState(location.cityName)
  const [areaName, setAreaName] = useState(location.areaName)

  const handleUseCurrentLocation = async () => {
    const success = await detectCurrentLocation()
    if (!success) {
      // If GPS fails/denied, keep modal open for manual selection
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!stateId || !cityId) return
    setLocationManually({
      stateId,
      cityId,
      areaId,
      stateName,
      cityName,
      areaName,
    })
  }

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900" style={{ fontFamily: 'Outfit,sans-serif' }}>
                  Choose Your Location
                </h3>
                <p className="text-xs text-slate-500 font-medium">Select city to discover nearby PGs</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Option 1: GPS Auto Location */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Option 1 — Automatic
              </p>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-75"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    {isDetecting ? (
                      <Loader2 size={18} className="animate-spin text-white" />
                    ) : (
                      <Navigation size={18} className="text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold block">
                      {isDetecting ? 'Detecting Location...' : '📍 Use Current Location'}
                    </span>
                    <span className="text-[11px] text-blue-100 font-normal">
                      Auto-detect GPS &amp; show nearest stays
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-blue-200" />
              </button>

              {detectionError && (
                <div className="mt-2.5 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{detectionError}</span>
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Option 2: Manual Selection */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Option 2 — Select Manually
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <LocationSelectorGroup
                  stateId={stateId}
                  cityId={cityId}
                  areaId={areaId}
                  onStateChange={(id, name) => {
                    setStateId(id)
                    setStateName(name)
                  }}
                  onCityChange={(id, name) => {
                    setCityId(id)
                    setCityName(name)
                  }}
                  onAreaChange={(id, name) => {
                    setAreaId(id)
                    setAreaName(name)
                  }}
                  horizontal={false}
                  onlyWithListings={false}
                />

                <button
                  type="submit"
                  disabled={!stateId || !cityId}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <CheckCircle2 size={16} />
                  Continue with Selected Location
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
