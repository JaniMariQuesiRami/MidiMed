import { auth, db } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { UserRole } from '@/types/db'

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (err) {
    console.error('Error in signOutUser:', err)
    throw err
  }
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  try {
    const current = auth.currentUser
    if (!current) return null
    const snap = await getDoc(doc(db, 'users', current.uid))
    return (snap.data()?.role ?? null) as UserRole | null
  } catch (err) {
    console.error('Error in getCurrentUserRole:', err)
    return null
  }
}
