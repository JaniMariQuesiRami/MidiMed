import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import type { Appointment, AppointmentStatus, MedicalRecord } from '@/types/db'
import { ReportButtons } from './ReportButtons'

export default function PatientAppointmentsTable({ title, appointments, records, onEdit, onDelete, onComplete, onViewRecord, translateStatus }: {
  title: string,
  appointments: Appointment[],
  records: MedicalRecord[],
  onEdit: (a: Appointment) => void,
  onDelete: (a: Appointment) => void,
  onComplete: (a: Appointment) => void,
  onViewRecord: (r: MedicalRecord) => void,
  translateStatus: (s: AppointmentStatus) => string
}) {
  return (
    <div className="mb-4">
      <h2 className="font-medium">{title}</h2>
      <div className="overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead>Reporte</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center">
                No hay citas
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((a) => (
              <TableRow key={a.appointmentId}>
                <TableCell>{format(new Date(a.scheduledStart), 'dd/MM/yyyy HH:mm')}</TableCell>
                <TableCell>{translateStatus(a.status)}</TableCell>
                <TableCell>{a.reason}</TableCell>
                <TableCell>
                  <ReportButtons appointment={a} />
                </TableCell>
                <TableCell className="flex gap-2">
                  <button onClick={() => onEdit(a)} className="cursor-pointer"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(a)} className="cursor-pointer"><Trash size={16} /></button>
                  {a.status === 'scheduled' && !a.medicalRecordId && (
                    <button onClick={() => onComplete(a)} className="text-primary hover:underline cursor-pointer">Completar</button>
                  )}
                  {a.status === 'completed' && a.medicalRecordId && (
                    <button onClick={() => {
                      const record = records.find(r => r.recordId === a.medicalRecordId)
                      if (record) onViewRecord(record)
                    }} className="text-muted-foreground hover:underline cursor-pointer">Ver registro</button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
