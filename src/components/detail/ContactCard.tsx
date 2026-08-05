import { Phone, MessageCircle, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

interface ContactCardProps {
  ownerPhone: string
  receptionPhone?: string | null
  whatsappNumber?: string | null
  onBookClick: () => void
}

export function ContactCard({ ownerPhone, receptionPhone, whatsappNumber, onBookClick }: ContactCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg sticky top-24">
      {/* CTA Header */}
      <div className="p-5 sm:p-6" style={{ background: 'linear-gradient(135deg,#EFF6FF,#F5F3FF)', borderBottom: '1px solid #E2E8F0' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBookClick}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base transition-all"
          style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)', boxShadow: '0 8px 24px rgba(37,99,235,0.30)' }}
        >
          <Calendar size={20} />
          Schedule a Free Visit
        </motion.button>
        <p className="text-center text-xs text-slate-500 mt-3 font-medium">
          ✅ Zero Brokerage · Direct Owner Contact
        </p>
      </div>

      {/* Contact options */}
      <div className="p-5 sm:p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Contact Owner</h3>

        {ownerPhone && (
          <motion.a
            whileHover={{ x: 4 }}
            href={`tel:${ownerPhone}`}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-blue-100 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</p>
                <p className="font-bold text-slate-900 text-sm">{ownerPhone}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all">Call</span>
          </motion.a>
        )}

        {receptionPhone && (
          <motion.a
            whileHover={{ x: 4 }}
            href={`tel:${receptionPhone}`}
            className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reception</p>
                <p className="font-bold text-slate-900 text-sm">{receptionPhone}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Call</span>
          </motion.a>
        )}

        {whatsappNumber && (
          <motion.a
            whileHover={{ x: 4 }}
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi, I am interested in your PG listed on NearPG.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">WhatsApp</p>
                <p className="font-bold text-slate-900 text-sm">{whatsappNumber}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">Chat</span>
          </motion.a>
        )}
      </div>
    </div>
  )
}
