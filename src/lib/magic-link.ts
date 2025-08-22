import { signInWithEmailLink, isSignInWithEmailLink } from "firebase/auth"
import { httpsCallable } from "firebase/functions"
import { auth, functions } from "./firebase"

// Determinar la URL base según el entorno
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://midimed.tech' 
    : 'http://localhost:3000'
}

export async function sendMagicLink(email: string): Promise<void> {
  const generateMagicSignInLink = httpsCallable<
    { email: string; redirectUrl?: string; dryRun?: boolean },
    { ok: boolean; link?: string; to?: string; template?: string; locale?: string; vars?: Record<string, unknown>; dryRun?: boolean }
  >(functions, "generateMagicSignInLink")

  const payload = {
    email: email.trim().toLowerCase(),
    redirectUrl: window.location.origin,
  }

  
  try {
    const res = await generateMagicSignInLink(payload)
    const link = res.data?.link
    if (link) window.location.href = link // solo dev
    localStorage.setItem("emailForSignIn", email)
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    const message = (err as { message?: string })?.message
    const msg =
      code === "functions/failed-precondition" ? "SMTP no configurado." :
      code === "functions/unavailable"        ? "Servicio no disponible. Intenta luego." :
      code === "functions/deadline-exceeded"  ? "Tiempo de espera agotado. Reintenta." :
      code === "functions/internal"           ? "No se pudo enviar el correo." :
      message || "Error al solicitar el enlace."
    console.error("sendMagicLink", { code, err })
    throw new Error(msg)
  }
}

export function isMagicLinkSignIn(): boolean {
  return isSignInWithEmailLink(auth, window.location.href)
}

export async function completeMagicLinkSignIn(): Promise<void> {
  if (!isMagicLinkSignIn()) {
    throw new Error('No magic link found in URL')
  }

  const storedEmail = window.localStorage.getItem('emailForSignIn')
  const url = new URL(window.location.href)
  const emailParam = url.searchParams.get('email')
  const email = storedEmail || emailParam

  if (!email) {
    throw new Error('Email not found for sign in')
  }

  try {
    await signInWithEmailLink(auth, email, window.location.href)
    // Limpiar el email del localStorage
    window.localStorage.removeItem('emailForSignIn')
  } catch (error) {
    console.error('Error completing magic link sign in:', error)
    throw error
  }
}
