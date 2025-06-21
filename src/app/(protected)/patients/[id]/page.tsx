'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getPatientById, getMedicalRecords, updatePatient} from '@/db/patients'
import { getAppointmentsInRange } from '@/db/appointments'
import type { Patient, MedicalRecord, Appointment } from '@/types/db'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import MedicalRecordFormModal from '@/components/MedicalRecordFormModal'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import { format } from 'date-fns'

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [openAppt, setOpenAppt] = useState(false)
  const [openRecord, setOpenRecord] = useState(false)
  const [editing, setEditing] = useState(false)
  const [info, setInfo] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  useEffect(() => {
    getPatientById(params.id)
      .then((p) => {
        setPatient(p)
        setInfo({
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email ?? '',
          phone: p.phone ?? '',
        })
      })
      .catch(() => {})
    getMedicalRecords(params.id).then(setRecords).catch(() => {})
    const start = new Date()
    start.setMonth(start.getMonth() - 12)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    getAppointmentsInRange(start, end, params.id).then(setAppointments).catch(() => {})
  }, [params.id])

  if (!patient) return <div className="p-2">Cargando...</div>

  const past = appointments.filter(
    (a) => new Date(a.scheduledStart) < new Date(),
  )
  const future = appointments.filter(
    (a) => new Date(a.scheduledStart) >= new Date(),
  )

  const saveInfo = async () => {
    if (!patient) return
    await updatePatient(patient.patientId, {
      ...patient,
      ...info,
    })
    toast.success('Información guardada')
    setEditing(false)
    setPatient({ ...patient, ...info })
  }

  return (
    <Wrapper>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <Section>
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Citas futuras</h2>
              <Button size="sm" onClick={() => setOpenAppt(true)}>
                Nueva cita
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {future.map((a) => (
                  <TableRow key={a.appointmentId}>
                    <TableCell>
                      {format(new Date(a.scheduledStart), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{a.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
          <Section>
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Historial de registros</h2>
              <Button size="sm" onClick={() => setOpenRecord(true)}>
                Nuevo registro
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resumen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.recordId}>
                    <TableCell>{r.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </div>
        <InfoCard>
          <h3 className="font-medium mb-2">Información</h3>
          {editing ? (
            <div className="space-y-2">
              <Input
                value={info.firstName}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, firstName: e.target.value }))
                }
                placeholder="Nombre"
              />
              <Input
                value={info.lastName}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, lastName: e.target.value }))
                }
                placeholder="Apellido"
              />
              <Input
                value={info.email}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Email"
              />
              <Input
                value={info.phone}
                onChange={(e) =>
                  setInfo((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="Teléfono"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveInfo}>
                  Guardar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p>
                <b>Nombre:</b> {patient.firstName} {patient.lastName}
              </p>
              {patient.email && (
                <p>
                  <b>Email:</b> {patient.email}
                </p>
              )}
              {patient.phone && (
                <p>
                  <b>Teléfono:</b> {patient.phone}
                </p>
              )}
              <Button size="sm" onClick={() => setEditing(true)} className="mt-2">
                Editar
              </Button>
            </div>
          )}
        </InfoCard>
      </div>
      <CreateAppointmentModal
        open={openAppt}
        onClose={() => setOpenAppt(false)}
        patientId={patient.patientId}
        onCreated={(a) => setAppointments((prev) => [...prev, a])}
      />
      <MedicalRecordFormModal
        open={openRecord}
        onClose={() => setOpenRecord(false)}
        patientId={patient.patientId}
        onCreated={(r) => setRecords((prev) => [...prev, r])}
      />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4`
const Section = tw.div`space-y-2`
const InfoCard = tw.div`border p-4 rounded w-full lg:w-64 h-max`
