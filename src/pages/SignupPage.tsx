import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, User, ArrowRight, Shield, RefreshCw, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { type ConfirmationResult } from 'firebase/auth'
import { sendOTP, verifyOTP, getFirebaseErrorMessage, clearRecaptcha } from '../services/auth.service'
import { profileService } from '../services/auth.service'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { useToast } from '../components/ui/Toast'
import OTPInput from '../components/auth/OTPInput'

type Step = 'details' | 'otp' | 'success'

export default function SignupPage() {
  const { isAuthenticated, isLoading, refreshProfile } = useFirebaseAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [step, setStep] = useState<Step>('details')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect already-logged-in users with a profile
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  useEffect(() => {
    return () => {
      clearRecaptcha()
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const startCountdown = useCallback(() => {
    setResendCountdown(30)
    countdownRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }, [])

  const validateDetails = (): boolean => {
    if (fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters.')
      return false
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Please enter a valid 10-digit phone number.')
      return false
    }
    setError('')
    return true
  }

  const handleSendOTP = async () => {
    if (!validateDetails()) return
    setIsSending(true)

    try {
      const result = await sendOTP(`+91${phone.trim()}`, 'recaptcha-container-signup')
      setConfirmationResult(result)
      setStep('otp')
      startCountdown()
      showToast('OTP sent to +91 ' + phone.trim(), 'success')
    } catch (err: unknown) {
      console.error('[SignupPage] sendOTP error:', err)
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return }
    if (!confirmationResult) return
    setError('')
    setIsVerifying(true)

    try {
      const credential = await verifyOTP(confirmationResult, otp)
      const uid = credential.user.uid

      // Upsert profile in Supabase (idempotent)
      await profileService.upsertProfile(uid, fullName.trim(), phone.trim())
      await refreshProfile()

      setStep('success')
      showToast('Account created! Welcome to NearPG 🎉', 'success')
      setTimeout(() => navigate('/'), 1500)
    } catch (err: unknown) {
      console.error('[SignupPage] verifyOTP error:', err)
      setError(getFirebaseErrorMessage(err))
      setOtp('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setOtp('')
    setError('')
    setIsSending(true)

    try {
      const result = await sendOTP(`+91${phone.trim()}`, 'recaptcha-container-signup')
      setConfirmationResult(result)
      startCountdown()
      showToast('OTP resent!', 'success')
    } catch (err: unknown) {
      console.error('[SignupPage] resendOTP error:', err)
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const handleBack = () => {
    setStep('details')
    setOtp('')
    setError('')
    clearRecaptcha()
  }

  return (
    <>
      <Helmet>
        <title>Create Account | NearPG</title>
        <meta name="description" content="Sign up on NearPG with your phone number. Find the best PGs near you." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-3 py-6 sm:px-4 sm:py-12"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        </div>

        <div className="relative w-full max-w-md fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl shadow-indigo-500/30">
              N
            </div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">NearPG</span>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-5 sm:mb-6 px-1">
            {(['details', 'otp', 'success'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black transition-all
                  ${step === s ? 'bg-indigo-500 text-white scale-110' :
                    (step === 'otp' && i === 0) || (step === 'success' && i < 2)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-slate-400'}`}>
                  {(step === 'otp' && i === 0) || (step === 'success' && i < 2) ? '✓' : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded transition-all ${
                  (step === 'otp' && i === 0) || (step === 'success')
                    ? 'bg-emerald-500' : 'bg-white/10'
                }`} />}
              </div>
            ))}
          </div>

          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-10"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
            }}>

            {step === 'details' && (
              <>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm font-medium mb-4 transition-colors group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Home
                </Link>

                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Create account</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Join NearPG to save properties, book visits, and more.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                        autoFocus
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl font-bold text-white text-sm shrink-0"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        <Phone size={15} className="text-indigo-400" />
                        +91
                      </div>
                      <input
                        id="signup-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        className="flex-1 px-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span className="text-rose-400">{error}</span>
                    </div>
                  )}

                  <button
                    id="signup-send-otp-btn"
                    onClick={handleSendOTP}
                    disabled={isSending || fullName.trim().length < 3 || phone.length !== 10}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    {isSending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending OTP…</>
                    ) : (
                      <>Send OTP <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                      Log in
                    </Link>
                  </p>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <button onClick={handleBack}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Go back
                </button>

                <div className="mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                    <Shield size={24} className="text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">Verify phone</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We sent a 6-digit code to{' '}
                    <span className="text-white font-semibold">+91 {phone}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OTPInput value={otp} onChange={setOtp} autoFocus />

                  {error && (
                    <div className="px-4 py-3 rounded-xl text-sm"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span className="text-rose-400">{error}</span>
                    </div>
                  )}

                  <button
                    id="signup-verify-otp-btn"
                    onClick={handleVerifyOTP}
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    {isVerifying ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating Account…</>
                    ) : (
                      <>Create Account <ArrowRight size={16} /></>
                    )}
                  </button>

                  <div className="flex items-center justify-center">
                    <button
                      id="signup-resend-btn"
                      onClick={handleResend}
                      disabled={resendCountdown > 0 || isSending}
                      className="flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ color: resendCountdown > 0 ? 'rgba(148,163,184,1)' : '#a78bfa' }}>
                      <RefreshCw size={14} className={isSending ? 'animate-spin' : ''} />
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
                  <CheckCircle2 size={40} className="text-emerald-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">You're in! 🎉</h1>
                <p className="text-slate-400 text-sm">Redirecting to home…</p>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
              <Shield size={12} className="text-slate-500" />
              <p className="text-xs text-slate-500">Protected by Firebase &amp; reCAPTCHA</p>
            </div>
          </div>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container-signup" />
      </div>
    </>
  )
}
