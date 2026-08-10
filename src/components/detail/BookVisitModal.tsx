import { useState, useEffect } from 'react'
import { X, Calendar, User, Phone, Mail, CheckCircle2, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateBooking } from '../../hooks/useBookings'
import { useToast } from '../ui/Toast'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'

const schema = z.object({
  user_name:   z.string().min(2, 'Name is required'),
  phone:       z.string().min(10, 'Valid phone number required'),
  email:       z.string().email('Valid email required').optional().or(z.literal('')),
  visit_date:  z.string().min(1, 'Please select a date'),
  visit_time:  z.string().min(1, 'Please select a time'),
  message:     z.string().optional(),
})
type BookingForm = z.infer<typeof schema>

const TIME_SLOTS = [
  { value: 'Morning (10AM - 12PM)',   label: '🌅 Morning',   sub: '10AM – 12PM' },
  { value: 'Afternoon (12PM - 4PM)',  label: '☀️ Afternoon', sub: '12PM – 4PM'  },
  { value: 'Evening (4PM - 7PM)',     label: '🌆 Evening',   sub: '4PM – 7PM'   },
]

const STEPS = ['Date & Time', 'Your Details', 'Confirm']

interface Props { pgId: string; pgName: string; isOpen: boolean; onClose: () => void }

export function BookVisitModal({ pgId, pgName, isOpen, onClose }: Props) {
  const { showToast }                              = useToast()
  const { profile }                                = useFirebaseAuth()
  const { mutate: createBooking, isPending }        = useCreateBooking()
  const [success, setSuccess]                      = useState(false)
  const [step,    setStep]                         = useState(0)

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BookingForm>({
    resolver: zodResolver(schema),
    defaultValues: { user_name: profile?.full_name ?? '', phone: profile?.phone_number ? `+91${profile.phone_number}` : '' },
  })

  useEffect(() => {
    if (profile) {
      setValue('user_name', profile.full_name ?? '')
      setValue('phone', profile.phone_number ? `+91${profile.phone_number}` : '')
    }
  }, [profile, setValue])

  const visitTime = watch('visit_time')
  const visitDate = watch('visit_date')

  const onSubmit = (data: BookingForm) => {
    createBooking({ ...data, pg_id: pgId }, {
      onSuccess: () => { setSuccess(true); showToast('Visit scheduled! 🎉') },
      onError: err  => showToast(err.message, 'error'),
    })
  }

  const handleClose = () => { reset(); setSuccess(false); setStep(0); onClose() }

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* ── Header ── */}
          <div className="px-6 py-5 flex items-center justify-between shrink-0"
            style={{ background: 'linear-gradient(135deg,#2563EB,#1D4ED8)' }}>
            <div>
              <h3 className="font-black text-white text-lg" style={{ fontFamily: 'Outfit,sans-serif' }}>Schedule a Visit</h3>
              <p className="text-blue-200 text-xs mt-0.5 line-clamp-1 max-w-[220px]">{pgName}</p>
            </div>
            <button onClick={handleClose} className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* ── Step Indicator ── */}
          {!success && (
            <div className="px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${i === step ? 'text-blue-700' : 'text-slate-400'}`}>{s}</span>
                    {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto p-6">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>Visit Scheduled! 🎉</h4>
                <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                  Your request has been sent to the owner. They'll confirm your visit shortly.
                </p>
                <button onClick={handleClose} className="btn-primary px-10 py-3">Done</button>
              </motion.div>
            ) : (
              <form id="book-visit-form" onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="step0"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Select Date <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            {...register('visit_date')}
                            className="input-base pl-10"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        {errors.visit_date && <p className="text-rose-500 text-xs mt-1">{errors.visit_date.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                          Select Time Slot <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map(slot => (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setValue('visit_time', slot.value)}
                              className={`p-3 rounded-2xl border-2 text-center transition-all ${
                                visitTime === slot.value
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="text-xl mb-1">{slot.label.split(' ')[0]}</div>
                              <p className={`text-xs font-bold ${visitTime === slot.value ? 'text-blue-700' : 'text-slate-700'}`}>
                                {slot.label.split(' ').slice(1).join(' ')}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{slot.sub}</p>
                            </button>
                          ))}
                        </div>
                        {errors.visit_time && <p className="text-rose-500 text-xs mt-2">{errors.visit_time.message}</p>}
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="step1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Your Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" {...register('user_name')} placeholder="Full Name" className="input-base pl-10" />
                        </div>
                        {errors.user_name && <p className="text-rose-500 text-xs mt-1">{errors.user_name.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Phone <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" {...register('phone')} placeholder="9876543210" className="input-base pl-10" />
                        </div>
                        {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email (Optional)</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="email" {...register('email')} placeholder="you@email.com" className="input-base pl-10" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message (Optional)</label>
                        <textarea
                          {...register('message')}
                          placeholder="Any specific requirements or questions?"
                          className="input-base resize-none h-24 py-3 text-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm mb-3">Booking Summary</h4>
                        {[
                          { label: 'Property', value: pgName },
                          { label: 'Date',     value: visitDate ? new Date(visitDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : '—' },
                          { label: 'Time',     value: visitTime || '—' },
                          { label: 'Name',     value: watch('user_name') || '—' },
                          { label: 'Phone',    value: watch('phone') || '—' },
                        ].map(row => (
                          <div key={row.label} className="flex items-start justify-between gap-4">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">{row.label}</span>
                            <span className="text-sm font-semibold text-slate-800 text-right">{row.value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                        ℹ️ The owner will confirm your visit via phone within 2–3 hours.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            )}
          </div>

          {/* ── Footer ── */}
          {!success && (
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 shrink-0">
              {step > 0 && (
                <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-3">
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex-1 py-3 text-sm"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  form="book-visit-form"
                  disabled={isPending}
                  className="btn-primary flex-1 py-3 text-sm"
                >
                  {isPending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling…</>
                  ) : (
                    <><CheckCircle2 size={16} /> Confirm Visit</>
                  )}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
