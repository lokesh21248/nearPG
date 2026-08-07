import { useState, useEffect } from 'react'
import { Bug, X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { useUserLocation } from '../../contexts/LocationContext'
import type { PGLite } from '../../types/pg.types'

interface DebugPanelProps {
  totalSupabaseRows: number
  filteredRows: PGLite[]
  allCalculatedRows: (PGLite & { distanceKm?: number; insideRadius?: boolean })[]
  errorMessage?: string | null
}

export function DebugPanel({
  totalSupabaseRows,
  filteredRows,
  allCalculatedRows,
  errorMessage,
}: DebugPanelProps) {
  const { location, isDetecting, detectionError } = useUserLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  // Check URL param ?debug=true or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('debug') === 'true' || localStorage.getItem('nearpg_debug') === 'true') {
      setShowDebug(true)
    }
  }, [])

  if (!showDebug) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md w-full bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 text-xs font-mono overflow-hidden">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(o => !o)}
        className="p-3 bg-slate-800 flex items-center justify-between cursor-pointer border-b border-slate-700 hover:bg-slate-750 transition-colors"
      >
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <Bug size={16} />
          <span>NearPG Debug Panel</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] text-emerald-300">
            {filteredRows.length} / {totalSupabaseRows} PGs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDebug(false)
              localStorage.removeItem('nearpg_debug')
            }}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content drawer */}
      {isOpen && (
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Location State */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-amber-400 uppercase text-[10px] tracking-wider">📍 User Coordinates &amp; Location</h4>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
              <div>Latitude: <span className="text-white font-bold">{location.latitude ?? 'null'}</span></div>
              <div>Longitude: <span className="text-white font-bold">{location.longitude ?? 'null'}</span></div>
              <div>State: <span className="text-white">{location.stateName || 'None'}</span></div>
              <div>City: <span className="text-white">{location.cityName || 'None'}</span></div>
              <div>Area: <span className="text-white">{location.areaName || 'None'}</span></div>
              <div>Radius: <span className="text-emerald-400 font-bold">{location.radius} km</span></div>
              <div>Detection: <span className="text-blue-400">{location.detectionType}</span></div>
              <div>Detecting?: <span className={isDetecting ? 'text-amber-400 animate-pulse' : 'text-slate-400'}>{isDetecting ? 'Yes...' : 'No'}</span></div>
            </div>
            {(detectionError || errorMessage) && (
              <div className="mt-2 text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-800/60 text-[10px]">
                🚨 Error: {detectionError || errorMessage}
              </div>
            )}
          </div>

          {/* Database & Queries Status */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <h4 className="font-bold text-blue-400 uppercase text-[10px] tracking-wider">📊 Supabase &amp; Calculation Stats</h4>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Total Supabase Rows:</span>
              <span className="font-bold text-white">{totalSupabaseRows}</span>
            </div>
            <div className="flex justify-between text-slate-300 text-[11px]">
              <span>Rows Inside Radius ({location.radius}km):</span>
              <span className="font-bold text-emerald-400">{filteredRows.length}</span>
            </div>
          </div>

          {/* Per-PG Calculations log */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">📏 Distance Calculations</h4>
            {allCalculatedRows.length === 0 ? (
              <p className="text-slate-500 italic text-[11px]">No PGs loaded from Supabase.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {allCalculatedRows.map(pg => (
                  <div key={pg.id} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                    <div className="truncate flex-1">
                      <span className="font-bold text-slate-200 block truncate">{pg.name}</span>
                      <span className="text-slate-500">{pg.area}, {pg.city} (Lat: {pg.latitude ?? 'N/A'}, Lng: {pg.longitude ?? 'N/A'})</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-white block">
                        {pg.distanceKm !== undefined && pg.distanceKm !== Infinity
                          ? `${pg.distanceKm.toFixed(2)} km`
                          : 'Infinity'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        pg.insideRadius ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'
                      }`}>
                        {pg.insideRadius ? 'YES' : 'NO'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
