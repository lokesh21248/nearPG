import { initializeApp, getApps } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// Warn if credentials are still the placeholder values
const isConfigured = !firebaseConfig.apiKey.startsWith('YOUR_')
if (!isConfigured) {
  console.warn(
    '[Firebase] ⚠️ Firebase is not configured.\n' +
    'Update the VITE_FIREBASE_* values in your .env file to enable phone-based auth.\n' +
    'The app will run in read-only mode (no login/signup) until configured.'
  )
}

// Prevent duplicate initialization in HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)

// Persist login across browser sessions
if (isConfigured) {
  setPersistence(auth, browserLocalPersistence).catch(console.error)
}

export default app
