import { auth, isFirebaseConfigured } from '../lib/firebase'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type ConfirmationResult,
} from 'firebase/auth'
import { supabase } from '../lib/supabase'
import type { UserProfile } from '../types/auth.types'

// ─── Error message map ───────────────────────────────────────────────────────

export function getFirebaseErrorMessage(error: unknown): string {
  if (!isFirebaseConfigured) {
    return 'Firebase configuration missing or using placeholder values. Please set valid VITE_FIREBASE_* keys.'
  }

  const errObj = (error || {}) as { code?: string; message?: string }
  let code = errObj.code ?? ''
  const message = errObj.message ?? String(error ?? '')

  // Extract code from message if code property is empty
  if (!code && message) {
    const match = message.match(/auth\/[a-z0-9-]+/i)
    if (match) code = match[0]
  }

  const messages: Record<string, string> = {
    'auth/invalid-phone-number': 'Please enter a valid 10-digit phone number.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/invalid-verification-code': 'Invalid OTP. Please check the code and try again.',
    'auth/code-expired': 'OTP code has expired. Please request a new one.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/captcha-check-failed': 'reCAPTCHA security check failed. Please refresh the page and try again.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/quota-exceeded': 'SMS quota exceeded for this project. Please try again later.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/operation-not-allowed': 'Phone sign-in is not enabled in Firebase Console (Authentication -> Sign-in method).',
    'auth/missing-verification-code': 'Please enter the 6-digit OTP.',
    'auth/session-expired': 'Your session has expired. Please request a new OTP.',
    'auth/api-key-not-valid': 'Invalid Firebase API Key. Please check VITE_FIREBASE_API_KEY in Vercel.',
    'auth/invalid-api-key': 'Invalid Firebase API Key. Please check VITE_FIREBASE_API_KEY in Vercel.',
    'auth/unauthorized-domain': 'Domain not authorized in Firebase Console (Authentication -> Settings -> Authorized domains).',
  }

  if (messages[code]) return messages[code]
  if (message.includes('reCAPTCHA')) return 'reCAPTCHA initialization failed. Please refresh the page.'
  if (message.includes('API key')) return 'Firebase API key is invalid or restricted.'

  return message || 'Authentication failed. Please try again.'
}

// ─── reCAPTCHA ───────────────────────────────────────────────────────────────

let recaptchaVerifier: RecaptchaVerifier | null = null

/**
 * Creates (or re-creates) an invisible RecaptchaVerifier bound to the given container element id.
 */
export function setupRecaptcha(containerId: string): RecaptchaVerifier {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration missing. Set VITE_FIREBASE_* environment variables.')
  }

  // Clear stale verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
    } catch {
      // ignore
    }
    recaptchaVerifier = null
  }

  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`reCAPTCHA container element #${containerId} not found in DOM.`)
  }

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {},
    'expired-callback': () => {
      clearRecaptcha()
    },
  })

  return recaptchaVerifier
}

export function clearRecaptcha(): void {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear()
    } catch {
      // ignore
    }
    recaptchaVerifier = null
  }
}

// ─── OTP ─────────────────────────────────────────────────────────────────────

/**
 * Sends an OTP to the given phone number (E.164 format expected: +91XXXXXXXXXX).
 */
export async function sendOTP(
  phoneE164: string,
  containerId: string
): Promise<ConfirmationResult> {
  const verifier = setupRecaptcha(containerId)
  return signInWithPhoneNumber(auth, phoneE164, verifier)
}


/**
 * Verifies the OTP with the confirmation result returned by sendOTP.
 */
export async function verifyOTP(
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<import('firebase/auth').UserCredential> {
  return confirmationResult.confirm(otp)
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
  clearRecaptcha()
}

// ─── Supabase Profile ─────────────────────────────────────────────────────────

export const profileService = {
  /**
   * Fetch the user's profile by their Firebase UID.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as UserProfile | null
  },

  /**
   * Check if a phone number already has a profile.
   */
  async getProfileByPhone(phone: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone_number', phone)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as UserProfile | null
  },

  /**
   * Create or update a profile. Safe to call multiple times (upsert).
   */
  async upsertProfile(uid: string, fullName: string, phoneNumber: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: uid,
          full_name: fullName,
          phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as UserProfile
  },

  /**
   * Update only the full_name field.
   */
  async updateName(uid: string, fullName: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', uid)

    if (error) throw new Error(error.message)
  },
}
