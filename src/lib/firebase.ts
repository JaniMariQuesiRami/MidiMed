import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getFunctions, type Functions } from "firebase/functions"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Only initialize when the API key is available (avoids build-time prerender crashes)
let app: FirebaseApp | undefined
if (firebaseConfig.apiKey) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
}

// Exportar servicios — consumers must only call these on the client where env vars are set
export const auth = app ? getAuth(app) : (undefined as unknown as Auth)
export const db = app ? getFirestore(app) : (undefined as unknown as Firestore)
export const functions = app ? getFunctions(app) : (undefined as unknown as Functions)
export const storage = app ? getStorage(app) : (undefined as unknown as FirebaseStorage)
