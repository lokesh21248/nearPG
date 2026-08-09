import { initializeApp, getApps } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('YOUR_') &&
  firebaseConfig.projectId &&
  !firebaseConfig.projectId.includes('YOUR_') &&
  firebaseConfig.appId &&
  !firebaseConfig.appId.includes('YOUR_')
)

if (!isFirebaseConfigured) {
  console.warn(
    '[Firebase] ⚠️ Firebase is not configured or uses placeholder values.\n' +
    'Update the VITE_FIREBASE_* environment variables to enable phone-based auth.'
  )
}

// Prevent duplicate initialization in HMR or re-renders
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)

// Persist login across browser sessions if properly configured
if (isFirebaseConfigured) {
  setPersistence(auth, browserLocalPersistence).catch(console.error)
}

export default app

