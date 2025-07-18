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
  patientId?: string,
  tenantId?: string,
): Promise<Appointment[]> {
  try {
    const conditions = [
      where('scheduledStart', '>=', start.toISOString()),
      where('scheduledStart', '<=', end.toISOString()),
    ]
    if (patientId) conditions.push(where('patientId', '==', patientId))
    if (tenantId) conditions.push(where('tenantId', '==', tenantId))

    const q = query(collection(db, 'appointments'), ...conditions)

    const snap = await getDocs(q)

    return snap.docs.map((d) => ({
      ...(d.data() as Omit<Appointment, 'appointmentId'>),
      appointmentId: d.id,
    }))
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
