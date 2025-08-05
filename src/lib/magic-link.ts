import { sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink } from 'firebase/auth'
import { auth } from './firebase'

// Determinar la URL base según el entorno
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NODE_ENV === 'production' 
    ? 'https://midimed.tech' 
    : 'http://localhost:3000'
}

export async function sendMagicLink(email: string): Promise<void> {
  try {
    const actionCodeSettings = {
      url: `${getBaseUrl()}/finishSignIn?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // Guardar el email en localStorage para recuperarlo después
    window.localStorage.setItem('emailForSignIn', email)
  } catch (error) {
    console.error('Error sending magic link:', error)
    throw error
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
