import { BedDouble, CheckCircle2, Ruler, Snowflake } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PGRoom } from '../../types/pg.types'

export function RoomTypes({ rooms }: { rooms: PGRoom[] }) {
  if (!rooms || rooms.length === 0) return null
  const sortedRooms = [...rooms].sort((a, b) => a.price - b.price)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BedDouble size={22} className="text-blue-600" />
        <h2 className="text-xl font-bold text-slate-900">Room Options</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedRooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
          >
            {/* Best value badge */}
            {i === 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                Best Value
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 flex-wrap" style={{ fontFamily: 'Outfit,sans-serif' }}>
                  {room.sharing_type}
                  {room.ac_type === 'AC' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                      <Snowflake size={9} /> AC
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <BedDouble size={14} className="text-blue-400" />
                    <span className={`font-medium ${room.available_beds === 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                      {room.available_beds === 0 ? 'No beds available' : `${room.available_beds} bed${room.available_beds > 1 ? 's' : ''} available`}
                    </span>
                  </div>
                  {room.room_size && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Ruler size={14} />
                      <span>{room.room_size}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0 ml-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Monthly Rent</p>
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-2xl font-black text-blue-600" style={{ fontFamily: 'Outfit,sans-serif' }}>
                    ₹{room.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-medium text-slate-400">/mo</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <span className="text-slate-600 font-medium">
                  Security: <strong className="text-slate-900">₹{room.security_deposit.toLocaleString('en-IN')}</strong>
                </span>
              </div>
              {room.available_beds > 0 && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Available" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
