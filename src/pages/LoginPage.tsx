import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Phone, ArrowRight, Shield, RefreshCw, ChevronLeft } from 'lucide-react'
import { type ConfirmationResult } from 'firebase/auth'
import { sendOTP, verifyOTP, getFirebaseErrorMessage, clearRecaptcha } from '../services/auth.service'
import { profileService } from '../services/auth.service'
import { useFirebaseAuth } from '../hooks/useFirebaseAuth'
import { useToast } from '../components/ui/Toast'
import OTPInput from '../components/auth/OTPInput'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const { isAuthenticated, isLoading, refreshProfile } = useFirebaseAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect already-logged-in users
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  // Cleanup reCAPTCHA on unmount
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
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleSendOTP = async () => {
    const trimmedPhone = phone.trim()
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }
    setError('')
    setIsSending(true)

    try {
      // First, check if the phone number has a profile in Supabase
      const existingProfile = await profileService.getProfileByPhone(trimmedPhone)
      if (!existingProfile) {
        setIsSending(false)
        navigate(`/signup?phone=${trimmedPhone}`)
        return
      }

      const result = await sendOTP(`+91${trimmedPhone}`, 'recaptcha-container-login')
      setConfirmationResult(result)
      setStep('otp')
      startCountdown()
      showToast('OTP sent to +91 ' + trimmedPhone, 'success')
    } catch (err: unknown) {
      console.error('[LoginPage] sendOTP error:', err)
      setError(getFirebaseErrorMessage(err))
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.')
      return
    }
    if (!confirmationResult) return
    setError('')
    setIsVerifying(true)

    try {
      const credential = await verifyOTP(confirmationResult, otp)
      const firebaseUser = credential.user

      // Check or create profile in Supabase
      await profileService.upsertProfile(
        firebaseUser.uid,
        firebaseUser.displayName ?? 'NearPG User',
        phone.trim()
      )

      await refreshProfile()
      showToast('Logged in successfully!', 'success')
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error('[LoginPage] verifyOTP error:', err)
      setError(getFirebaseErrorMessage(err))
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
      const result = await sendOTP(`+91${phone}`, 'recaptcha-container-login')
      setConfirmationResult(result)
      startCountdown()
      showToast('OTP resent!', 'success')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(getFirebaseErrorMessage(code))
    } finally {
      setIsSending(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setOtp('')
    setError('')
    clearRecaptcha()
  }

  return (
    <>
      <Helmet>
        <title>Login | NearPG</title>
        <meta name="description" content="Log in to NearPG with your phone number. No password required." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-3 py-6 sm:px-4 sm:py-12"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>

        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
            style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-md fade-in">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-2xl shadow-indigo-500/30">
              N
            </div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-tight">NearPG</span>
          </div>

          <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-10"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
            }}>

            {step === 'phone' ? (
              <>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs sm:text-sm font-medium mb-4 transition-colors group"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Home
                </Link>

                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">Welcome back</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Enter your phone number to receive a one-time password.
                  </p>
                </div>

                <div className="space-y-5">
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
                        id="login-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="98765 43210"
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value.replace(/\D/g, ''))
                          setError('')
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        className="flex-1 px-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-indigo-500/50"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span className="text-rose-400 leading-relaxed">{error}</span>
                    </div>
                  )}

                  <button
                    id="login-send-otp-btn"
                    onClick={handleSendOTP}
                    disabled={isSending || phone.length !== 10}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-slate-400 text-sm">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                <button onClick={handleBack}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium mb-6 transition-colors group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  Change number
                </button>

                <div className="mb-8">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
                    <Shield size={24} className="text-indigo-400" />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">Enter OTP</h1>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    We sent a 6-digit code to{' '}
                    <span className="text-white font-semibold">+91 {phone}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OTPInput value={otp} onChange={setOtp} autoFocus />

                  {error && (
                    <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      <span className="text-rose-400 leading-relaxed">{error}</span>
                    </div>
                  )}

                  <button
                    id="login-verify-otp-btn"
                    onClick={handleVerifyOTP}
                    disabled={isVerifying || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify & Login
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center">
                    <button
                      id="login-resend-btn"
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

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2">
              <Shield size={12} className="text-slate-500" />
              <p className="text-xs text-slate-500">Protected by Firebase &amp; reCAPTCHA</p>
            </div>
          </div>
        </div>

        {/* Invisible reCAPTCHA container */}
        <div id="recaptcha-container-login" />
      </div>
    </>
  )
}
