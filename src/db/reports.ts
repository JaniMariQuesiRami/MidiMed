import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore'
import type { Appointment, Patient, MedicalRecord } from '@/types/db'
import { getAllAppointments } from './appointments'
import { getPatients, getAllMedicalRecords } from './patients'
import { differenceInWeeks } from 'date-fns'

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

export async function getAllReportData(tenantId: string) {
  try {
    // Obtener todas las citas completadas
    const completedAppointmentsQuery = query(
      collection(db, 'appointments'),
      where('tenantId', '==', tenantId),
      where('status', '==', 'completed'),
      orderBy('scheduledStart', 'asc')
    )
    const completedSnap = await getDocs(completedAppointmentsQuery)
    const completedAppointments = completedSnap.docs.map((d) => d.data() as Appointment)

    // Obtener todas las citas para totales
    const allAppointments = await getAllAppointments(tenantId)

    // Obtener todos los pacientes
    const patients = await getPatients(tenantId)

    // Obtener todos los registros médicos
    const medicalRecords = await getAllMedicalRecords(tenantId)

    return {
      completedAppointments,
      allAppointments,
      patients,
      medicalRecords,
    }
  } catch (err) {
    console.error('Error in getAllReportData:', err)
    return {
      completedAppointments: [],
      allAppointments: [],
      patients: [],
      medicalRecords: [],
    }
  }
}

export function calculateKPIs(
  completedAppointments: Appointment[],
  allAppointments: Appointment[],
  patients: Patient[],
  medicalRecords: MedicalRecord[]
) {
  const completedCount = completedAppointments.length
  const totalAppointments = allAppointments.length
  const uniquePatients = new Set(allAppointments.map((a: Appointment) => a.patientId)).size
  const totalPatients = Math.max(patients.length, uniquePatients)

  // Calcular promedio semanal basado en el período real desde la primera cita
  let avgPerWeek = 0
  if (completedAppointments.length > 0) {
    const firstAppointmentDate = new Date(completedAppointments[0].scheduledStart)
    const now = new Date()
    const totalWeeks = differenceInWeeks(now, firstAppointmentDate)
    avgPerWeek = totalWeeks > 0 ? completedCount / totalWeeks : completedCount
  }

  return {
    totalPatients,
    totalAppointments,
    completedAppointments: completedCount,
    cancelledAppointments: 0, // Podríamos agregar lógica para canceladas si tenemos ese campo
    avgPerWeek,
    totalRecords: medicalRecords.length,
  }
}
