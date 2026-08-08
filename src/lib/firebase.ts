import { initializeApp, getApps } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'

export const firebaseConfig = {
  apiKey: "AIzaSyBa1Arilraettuqi_8IA0v4Qae0mwrkYjQ",
  authDomain: "anushabazaar-2288e.firebaseapp.com",
  databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com",
  projectId: "anushabazaar-2288e",
  storageBucket: "anushabazaar-2288e.firebasestorage.app",
  messagingSenderId: "64875938387",
  appId: "1:64875938387:web:373fac0da412dffbba7ca6",
  measurementId: "G-PJPZKKWSQM"
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

