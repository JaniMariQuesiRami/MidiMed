import { auth, db } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
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
  invitedBy: string = '',
): Promise<void> {
  try {
    const displayName = email.split('@')[0]
    const now = new Date().toISOString()

    // 1. Crear usuario en Auth con contraseña temporal
    const tempPassword = `Temp-${Math.floor(Math.random() * 1000000)}`
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
    const authUser = userCredential.user

    // 2. Asignar displayName opcionalmente
    await updateProfile(authUser, { displayName })

    // 3. Crear documento en Firestore
    await setDoc(doc(db, 'users', authUser.uid), {
      tenantId,
      uid: authUser.uid,
      email,
      displayName,
      role,
      invitedBy,
      createdAt: now,
      lastLoginAt: '',
    })

    // 4. Enviar email para establecer nueva contraseña
    await sendPasswordResetEmail(auth, email)
  } catch (err) {
    console.error('Error in inviteUser:', err)
    throw err
  }
}
