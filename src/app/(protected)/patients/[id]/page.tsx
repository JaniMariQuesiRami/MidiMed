'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@/contexts/UserContext'
import {
  getPatientById,
  getMedicalRecords,
  updatePatient,
  deletePatient,
  deleteMedicalRecord,
} from '@/db/patients'
import { getAppointmentsInRange, deleteAppointment } from '@/db/appointments'
import type { Patient, MedicalRecord, Appointment } from '@/types/db'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import MedicalRecordFormModal from '@/components/MedicalRecordFormModal'
import { Plus, Pencil, Trash } from 'lucide-react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import { format } from 'date-fns'

export default function PatientDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { tenant } = useUser()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [openAppt, setOpenAppt] = useState(false)
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null)
  const [openRecord, setOpenRecord] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)
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
    if (tenant)
      getMedicalRecords(params.id, tenant.tenantId).then(setRecords).catch(() => {})
    const start = new Date()
    start.setMonth(start.getMonth() - 12)
    const end = new Date()
    end.setFullYear(end.getFullYear() + 1)
    if (tenant)
      getAppointmentsInRange(start, end, params.id, tenant.tenantId)
        .then(setAppointments)
        .catch(() => {})
  }, [params.id, tenant])

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
              <Button size="sm" onClick={() => setOpenAppt(true)} className="flex items-center gap-1">
                Nueva cita <Plus size={14} />
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {future.map((a) => (
                  <TableRow key={a.appointmentId}>
                    <TableCell>
                      {format(new Date(a.scheduledStart), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{a.status}</TableCell>
                    <TableCell>{a.reason}</TableCell>
                    <TableCell className="flex gap-2">
                      <button onClick={() => { setEditingAppt(a); setOpenAppt(true); }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={async () => {
                        if (confirm('Eliminar cita?')) {
                          await deleteAppointment(a.appointmentId)
                          setAppointments((prev) => prev.filter(p => p.appointmentId !== a.appointmentId))
                        }
                      }}>
                        <Trash size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
        </Section>
        <Section>
          <h2 className="font-medium">Citas pasadas</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {past.map((a) => (
                <TableRow key={a.appointmentId}>
                  <TableCell>
                    {format(new Date(a.scheduledStart), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.reason}</TableCell>
                  <TableCell className="flex gap-2">
                    <button onClick={() => { setEditingAppt(a); setOpenAppt(true); }}>
                      <Pencil size={16} />
                    </button>
                    <button onClick={async () => {
                      if (confirm('Eliminar cita?')) {
                        await deleteAppointment(a.appointmentId)
                        setAppointments((prev) => prev.filter(p => p.appointmentId !== a.appointmentId))
                      }
                    }}>
                      <Trash size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
        <Section>
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Historial de registros</h2>
              <Button size="sm" onClick={() => setOpenRecord(true)} className="flex items-center gap-1">
                Nuevo registro <Plus size={14} />
              </Button>
            </div>
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resumen</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.recordId}>
                    <TableCell>{r.summary}</TableCell>
                    <TableCell className="flex gap-2">
                      <button onClick={() => { setEditingRecord(r); setOpenRecord(true); }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={async () => {
                        if (confirm('Eliminar registro?')) {
                          await deleteMedicalRecord(r.recordId)
                          setRecords((prev) => prev.filter(p => p.recordId !== r.recordId))
                        }
                      }}>
                        <Trash size={16} />
                      </button>
                    </TableCell>
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
                type="tel"
                pattern="^\+\d{1,3}\s?\d{8}$"
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
              <Button size="sm" onClick={() => setEditing(true)} className="mt-2 flex items-center gap-1">
                Editar <Pencil size={14} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={async () => {
                  if (
                    confirm('Eliminar paciente y todos sus registros?')
                  ) {
                    for (const a of appointments) {
                      await deleteAppointment(a.appointmentId)
                    }
                    for (const r of records) {
                      await deleteMedicalRecord(r.recordId)
                    }
                    await deletePatient(patient.patientId)
                    toast.success('Paciente eliminado')
                    router.push('/patients')
                  }
                }}
                className="mt-2"
              >
                Eliminar
              </Button>
            </div>
          )}
        </InfoCard>
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
        }}
        patientId={patient.patientId}
        record={editingRecord}
        onCreated={(r) => setRecords((prev) => [...prev, r])}
        onUpdated={(r) =>
          setRecords((prev) => prev.map((p) => (p.recordId === r.recordId ? r : p)))
        }
      />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Section = tw.div`space-y-2`
const InfoCard = tw.div`border p-4 rounded w-full lg:w-64 h-max`
