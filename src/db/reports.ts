import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import type { Appointment } from '@/types/db'

export async function getCompletedAppointmentsInRange(
  tenantId: string,
  start: Date,
  end: Date,
): Promise<Appointment[]> {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'completed'),
      where('scheduledStart', '>=', start.toISOString()),
      where('scheduledStart', '<=', end.toISOString()),
    )
    // Firestore index needed: appointments(tenantId, status, scheduledStart)
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as Appointment)
  } catch (err) {
    console.error('Error in getCompletedAppointmentsInRange:', err)
    return []
  }
}
