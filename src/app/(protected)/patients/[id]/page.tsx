'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPatientById, getMedicalRecords, getAppointmentsInRange } from '@/db/patients'
import type { Patient, MedicalRecord, Appointment } from '@/types/db'
import tw from 'tailwind-styled-components'
import { format } from 'date-fns'

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    getPatientById(params.id).then(setPatient).catch(() => {})
    getMedicalRecords(params.id).then(setRecords).catch(() => {})
    const start = new Date()
    start.setMonth(start.getMonth() - 12)
    const end = new Date()
    getAppointmentsInRange(start, end, params.id).then(setAppointments).catch(() => {})
  }, [params.id])

  if (!patient) return <div className="p-2">Cargando...</div>

  return (
    <Wrapper>
      <h1 className="text-xl font-medium mb-2">
        {patient.firstName} {patient.lastName}
      </h1>
      <Section>
        <h2 className="font-medium">Historial de citas</h2>
        <ul className="list-disc pl-6">
          {appointments.map((a) => (
            <li key={a.appointmentId}>
              {format(new Date(a.scheduledStart), 'dd/MM/yyyy')} - {a.status}
            </li>
          ))}
        </ul>
      </Section>
      <Section>
        <h2 className="font-medium">Registros médicos</h2>
        <ul className="list-disc pl-6">
          {records.map((r) => (
            <li key={r.recordId}>{r.summary}</li>
          ))}
        </ul>
      </Section>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4`
const Section = tw.div`space-y-2`
