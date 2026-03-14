// Firebase Admin SDK initialization for server-side usage (API routes, server components).
// Uses lazy initialization to avoid build-time failures when env vars are unavailable.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-1-A)
// - 2026-03-14: Lazy initialization to prevent build-time errors

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  }
  return getFirestore()
}

export { getAdminDb }
