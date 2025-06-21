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
): Promise<Appointment[]> {
  const conditions = [
    where('scheduledStart', '>=', start.toISOString()),
    where('scheduledStart', '<=', end.toISOString()),
  ]
  if (patientId) conditions.push(where('patientId', '==', patientId))
  const q = query(collection(db, 'appointments'), ...conditions)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Appointment, 'appointmentId'>), appointmentId: d.id }))
}

export async function createAppointment(data: AppointmentInput): Promise<void> {
  const ref = doc(collection(db, 'appointments'))
  const now = new Date().toISOString()
  await setDoc(ref, {
    ...data,
    appointmentId: ref.id,
    createdAt: now,
  })
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const ref = doc(db, 'appointments', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Appointment not found')
  return snap.data() as Appointment
}

export async function updateAppointment(id: string, data: AppointmentInput): Promise<void> {
  const ref = doc(db, 'appointments', id)
  await updateDoc(ref, data)
}

export async function deleteAppointment(id: string): Promise<void> {
  await deleteDoc(doc(db, 'appointments', id))
}
