import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { Appointment, AppointmentInput } from '@/types/db'

export async function getAppointmentsInRange(
  start: Date,
  end: Date,
  patientIds?: string | string[],
  tenantId?: string,
  providerIds?: string | string[],
): Promise<Appointment[]> {
  try {
    const pIds = Array.isArray(patientIds)
      ? patientIds
      : patientIds
      ? [patientIds]
      : []
    const dIds = Array.isArray(providerIds)
      ? providerIds
      : providerIds
      ? [providerIds]
      : []

    const conditions = [
      where('scheduledStart', '>=', start.toISOString()),
      where('scheduledStart', '<=', end.toISOString()),
    ]
    if (tenantId) conditions.push(where('tenantId', '==', tenantId))
    if (pIds.length > 0 && dIds.length === 0) {
      // Firestore composite index required: tenantId + patientId + scheduledStart
      conditions.push(where('patientId', 'in', pIds))
    } else if (dIds.length > 0 && pIds.length === 0) {
      // Firestore composite index required: tenantId + providerId + scheduledStart
      conditions.push(where('providerId', 'in', dIds))
    }

    const q = query(collection(db, 'appointments'), ...conditions)
    const snap = await getDocs(q)

    let list = snap.docs.map((d) => ({
      ...(d.data() as Omit<Appointment, 'appointmentId'>),
      appointmentId: d.id,
    }))

    if (pIds.length > 0) list = list.filter((a) => pIds.includes(a.patientId))
    if (dIds.length > 0) list = list.filter((a) => dIds.includes(a.providerId))

    return list
  } catch (err) {
    console.error('Error in getAppointmentsInRange:', err)
    return []
  }
}

export async function createAppointment(
  data: AppointmentInput & { tenantId: string; createdBy: string },
): Promise<string> {
  try {
    const ref = doc(collection(db, 'appointments'))
    const now = new Date().toISOString()
    await setDoc(ref, {
      ...data,
      appointmentId: ref.id,
      createdAt: now,
    })
    return ref.id
  } catch (err) {
    console.error('Error in createAppointment:', err)
    throw err
  }
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  try {
    const ref = doc(db, 'appointments', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) throw new Error('Appointment not found')
    return snap.data() as Appointment
  } catch (err) {
    console.error('Error in getAppointmentById:', err)
    throw err
  }
}

export async function updateAppointment(id: string, data: AppointmentInput): Promise<void> {
  try {
    const ref = doc(db, 'appointments', id)
    await updateDoc(ref, data)
  } catch (err) {
    console.error('Error in updateAppointment:', err)
    throw err
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'appointments', id))
  } catch (err) {
    console.error('Error in deleteAppointment:', err)
    throw err
  }
}

export async function getAllAppointments(tenantId: string): Promise<Appointment[]> {
  try {
    const q = query(collection(db, 'appointments'), where('tenantId', '==', tenantId))
    const snap = await getDocs(q)
    
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<Appointment, 'appointmentId'>),
      appointmentId: d.id,
    }))
  } catch (err) {
    console.error('Error in getAllAppointments:', err)
    return []
  }
}
