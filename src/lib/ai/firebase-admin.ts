/**
 * Firebase Admin SDK initialization for server-side API routes.
 * Uses a singleton pattern to avoid re-initialization on hot reloads.
 * Only usable in server-side code (API routes, server components).
 *
 * Changelog:
 * - 2026-02-19: Initial creation (SCRIBE-002)
 */

import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"

function getFirebaseAdminApp(): App {
  const existingApps = getApps()

  if (existingApps.length > 0) {
    return existingApps[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
  }

  // Fallback: initialize without explicit credentials (works in GCP environments)
  return initializeApp()
}

/**
 * Returns a Firebase Admin Auth instance for verifying ID tokens.
 */
export function getAdminAuth(): Auth {
  const app = getFirebaseAdminApp()
  return getAuth(app)
}
