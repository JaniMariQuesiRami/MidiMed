import { auth, db } from '@/lib/firebase'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { User, UserRole, Invite } from '@/types/db'

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
): Promise<string> { // Retorna la contraseña temporal
  try {
    const displayName = email.split('@')[0]
    const now = new Date().toISOString()
    const tempPassword = `Temp-${Math.floor(Math.random() * 1000000)}`
    
    // Crear ID único para la invitación
    const inviteRef = doc(collection(db, 'invites'))
    const inviteId = inviteRef.id

    // Fecha de expiración (30 días)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Crear invitación con contraseña temporal
    await setDoc(inviteRef, {
      tenantId,
      inviteId,
      email,
      displayName,
      role,
      invitedBy,
      createdAt: now,
      status: 'pending',
      expiresAt,
      tempPassword // Guardamos la contraseña temporal
    })
    
    return tempPassword
    
  } catch (err) {
    console.error('Error in inviteUser:', err)
    throw err
  }
}

export async function getInvitesByTenant(tenantId: string): Promise<Invite[]> {
  try {
    const q = query(
      collection(db, 'invites'), 
      where('tenantId', '==', tenantId),
      where('status', '==', 'pending')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ 
      ...(d.data() as Omit<Invite, 'inviteId'>), 
      inviteId: d.id 
    }))
  } catch (err) {
    console.error('Error in getInvitesByTenant:', err)
    return []
  }
}

export async function loginWithInvitation(email: string, tempPassword: string): Promise<void> {
  try {
    // Buscar invitación pendiente
    const invitesQuery = query(
      collection(db, 'invites'), 
      where('email', '==', email),
      where('status', '==', 'pending'),
      where('tempPassword', '==', tempPassword)
    )
    const invitesSnap = await getDocs(invitesQuery)

    if (invitesSnap.empty) {
      throw new Error('Invitación no encontrada o contraseña incorrecta')
    }

    const inviteDoc = invitesSnap.docs[0]
    const invitationData = inviteDoc.data()

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
    const user = userCredential.user

    // Actualizar perfil
    await updateProfile(user, { displayName: invitationData.displayName })

    // Crear documento de usuario
    await setDoc(doc(db, 'users', user.uid), {
      tenantId: invitationData.tenantId,
      uid: user.uid,
      email: invitationData.email,
      displayName: invitationData.displayName,
      role: invitationData.role,
      invitedBy: invitationData.invitedBy,
      createdAt: invitationData.createdAt,
      lastLoginAt: new Date().toISOString(),
    })

    // Marcar invitación como aceptada
    await updateDoc(inviteDoc.ref, { status: 'accepted' })

  } catch (err) {
    console.error('Error in loginWithInvitation:', err)
    throw err
  }
}
