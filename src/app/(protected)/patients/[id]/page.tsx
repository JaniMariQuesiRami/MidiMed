'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  getPatientById,
  getMedicalRecords,
  deleteMedicalRecord,
} from '@/db/patients'
import { getAppointmentsInRange, deleteAppointment } from '@/db/appointments'
import type { Patient, MedicalRecord, Appointment, AppointmentStatus } from '@/types/db'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import MedicalRecordFormModal from '@/components/MedicalRecordFormModal'
import tw from 'tailwind-styled-components'
import LoadingSpinner from '@/components/LoadingSpinner'
import EditPatientModal from '@/components/EditPatientModal'
import PatientInfoCard from '@/components/PatientInfoCard'
import PatientAppointmentsTable from '@/components/PatientAppointmentsTable'
import PatientRecordsTable from '@/components/PatientRecordsTable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>()
  const { tenant } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [openAppt, setOpenAppt] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [openRecord, setOpenRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
  const [openEdit, setOpenEdit] = useState(false)
  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null)

  const translateStatus = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'completed': return 'Completada'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  useEffect(() => {
    getPatientById(params.id)
      .then((p) => {
        setPatient(p)
      })
      .catch(() => { })
    if (tenant)
      getMedicalRecords(params.id, tenant.tenantId).then(setRecords).catch(() => { })
    const start = new Date()
    start.setMonth(start.getMonth() - 12)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    if (tenant)
      getAppointmentsInRange(start, end, params.id, tenant.tenantId)
        .then(setAppointments)
        .catch(() => { })
  }, [params.id, tenant])

  if (!patient)
    return (
      <div className="p-2 flex justify-center">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    )

  const past = appointments.filter(
    (a) => new Date(a.scheduledStart) < new Date(),
  )
  const future = appointments.filter(
    (a) => new Date(a.scheduledStart) >= new Date(),
  )


  return (
    <Wrapper>
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        <div className="flex-1 space-y-4">
          <Section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-lg">Citas futuras</h2>
              <Button size="sm" onClick={() => setOpenAppt(true)} className="flex items-center gap-1">
                Nueva cita <Plus size={14} />
              </Button>
            </div>
            <PatientAppointmentsTable
              title=""
              appointments={future}
              records={records}
              onEdit={(a) => { setEditingAppt(a); setOpenAppt(true); }}
              onDelete={async (a) => {
                if (confirm('Eliminar cita?')) {
                  await deleteAppointment(a.appointmentId)
                  setAppointments((prev) => prev.filter(p => p.appointmentId !== a.appointmentId))
                }
              }}
              onComplete={(a) => { setEditingRecord(null); setCompletingAppt(a); setOpenRecord(true); }}
              onViewRecord={(r) => { setEditingRecord(r); setOpenRecord(true); }}
              translateStatus={translateStatus}
            />
          </Section>
          <Section>
            <h2 className="font-medium text-lg mb-2">Citas pasadas</h2>
            <PatientAppointmentsTable
              title=""
              appointments={past}
              records={records}
              onEdit={(a) => { setEditingAppt(a); setOpenAppt(true); }}
              onDelete={async (a) => {
                if (confirm('Eliminar cita?')) {
                  await deleteAppointment(a.appointmentId)
                  setAppointments((prev) => prev.filter(p => p.appointmentId !== a.appointmentId))
                }
              }}
              onComplete={(a) => { setEditingRecord(null); setCompletingAppt(a); setOpenRecord(true); }}
              onViewRecord={(r) => { setEditingRecord(r); setOpenRecord(true); }}
              translateStatus={translateStatus}
            />
          </Section>
          <Section>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-lg">Historial de registros médicos</h2>
              <Button size="sm" onClick={() => setOpenRecord(true)} className="flex items-center gap-1">
                Nuevo registro <Plus size={14} />
              </Button>
            </div>
            <PatientRecordsTable
              records={records}
              appointments={appointments}
              onEdit={(r) => { setEditingRecord(r); setOpenRecord(true); }}
              onDelete={async (r) => {
                if (confirm('Eliminar registro?')) {
                  await deleteMedicalRecord(r.recordId)
                  setRecords((prev) => prev.filter(p => p.recordId !== r.recordId))
                }
              }}
            />
          </Section>
        </div>
        <PatientInfoCard patient={patient} onEdit={() => setOpenEdit(true)} />
      </div>
      <CreateAppointmentModal
        open={openAppt}
        onClose={() => {
          setOpenAppt(false)
          setEditingAppt(null)
        }}
        patientId={patient.patientId}
        appointment={editingAppt}
        onCreated={(a) => setAppointments((prev) => [...prev, a])}
        onUpdated={(a) =>
          setAppointments((prev) =>
            prev.map((p) => (p.appointmentId === a.appointmentId ? a : p)),
          )
        }
      />
      <MedicalRecordFormModal
        open={openRecord}
        onClose={() => {
          setOpenRecord(false)
          setEditingRecord(null)
          setCompletingAppt(null)
        }}
        patientId={patient.patientId}
        appointmentId={completingAppt?.appointmentId}
        patientBirthDate={patient.birthDate}
        record={editingRecord}
        onCreated={(r) => {
          setRecords((prev) => [...prev, r])
          if (completingAppt) {
            setAppointments((prev) =>
              prev.map((p) =>
                p.appointmentId === completingAppt.appointmentId
                  ? { ...p, status: 'completed', medicalRecordId: r.recordId }
                  : p,
              ),
            )
          }
        }}
        onUpdated={(r) =>
          setRecords((prev) => prev.map((p) => (p.recordId === r.recordId ? r : p)))
        }
      />
      <EditPatientModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        patient={patient}
        onUpdated={(p) => setPatient(p)}
      />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Section = tw.div`space-y-2 mb-6`
