export interface UserProfile {
  id: string // Firebase UID
  full_name: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  uid: string
  phoneNumber: string | null
}

export type OTPStep = 'phone' | 'otp'

export interface FirebaseAuthError {
  code: string
  message: string
}
