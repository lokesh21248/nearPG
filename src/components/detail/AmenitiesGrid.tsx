import {
  Wifi, Snowflake, ParkingCircle, Utensils,
  WashingMachine, Dumbbell, Tv, Zap,
  Bath, Shirt, BookOpen, Refrigerator,
  Car, Bike, Wind, DoorOpen, Check, Video,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { PGAmenity } from '../../types/pg.types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; color?: string }>> = {
  'WiFi':             Wifi,
  'AC':               Snowflake,
  'Parking':          ParkingCircle,
  'Food Included':    Utensils,
  'Laundry':          WashingMachine,
  'Housekeeping':     Shirt,
  'RO Water':         Utensils,
  'Lift':             DoorOpen,
  'Power Backup':     Zap,
  'CCTV':             Video,
  'Gym':              Dumbbell,
  'TV':               Tv,
  'Geyser':           Zap,
  'Attached Bathroom': Bath,
  'Balcony':          Wind,
  'Cupboard':         Shirt,
  'Study Table':      BookOpen,
  'Refrigerator':     Refrigerator,
  'Washing Machine':  WashingMachine,
  'Bike Parking':     Bike,
  'Car Parking':      Car,
}

const COLORS: Record<string, string> = {
  'WiFi': '#2563EB', 'AC': '#0EA5E9', 'Gym': '#7C3AED',
  'Food Included': '#16A34A', 'CCTV': '#DC2626', 'Power Backup': '#D97706',
  'Geyser': '#D97706', 'Parking': '#64748B', 'Laundry': '#0891B2',
}

const DEFAULT_AMENITIES: PGAmenity[] = [
  { id: 'def-1', pg_id: '', amenity_name: 'WiFi', created_at: '' },
  { id: 'def-2', pg_id: '', amenity_name: 'Power Backup', created_at: '' },
  { id: 'def-3', pg_id: '', amenity_name: 'RO Water', created_at: '' },
  { id: 'def-4', pg_id: '', amenity_name: 'Housekeeping', created_at: '' },
  { id: 'def-5', pg_id: '', amenity_name: 'CCTV', created_at: '' },
  { id: 'def-6', pg_id: '', amenity_name: 'Attached Bathroom', created_at: '' },
]

export function AmenitiesGrid({ amenities }: { amenities: PGAmenity[] }) {
  const displayAmenities = (amenities && amenities.length > 0) ? amenities : DEFAULT_AMENITIES
  const isDefault = !amenities || amenities.length === 0

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Amenities &amp; Facilities</h2>
          {isDefault && <p className="text-xs text-slate-400 font-medium">Standard features provided</p>}
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-500">{displayAmenities.length} amenities</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {displayAmenities.map((a, i) => {
          const Icon  = ICON_MAP[a.amenity_name] || Check
          const color = COLORS[a.amenity_name] || '#2563EB'
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={16} className="sm:hidden transition-colors" color={color} strokeWidth={1.8} />
                <Icon size={18} className="hidden sm:block transition-colors" color={color} strokeWidth={1.8} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight">{a.amenity_name}</span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
