import { db } from '@/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import type { User, UserRole } from '@/types/db'

export async function getUsersByTenant(tenantId: string): Promise<User[]> {
  try {
    const q = query(collection(db, 'users'), where('tenantId', '==', tenantId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ ...(d.data() as Omit<User, 'uid'>), uid: d.id }))
  } catch (err) {
    console.error('Error in getUsersByTenant:', err)
    return []
  }
}

export async function inviteUser(
  tenantId: string,
  email: string,
  role: UserRole = 'staff',
): Promise<void> {
  try {
    const ref = doc(collection(db, 'users'))
    const now = new Date().toISOString()
    await setDoc(ref, {
      tenantId,
      uid: ref.id,
      email,
      displayName: '',
      role,
      createdAt: now,
      lastLoginAt: '',
    })
  } catch (err) {
    console.error('Error in inviteUser:', err)
    throw err
  }
}
