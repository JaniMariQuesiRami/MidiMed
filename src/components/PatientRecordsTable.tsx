import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import type { MedicalRecord, Appointment } from '@/types/db'

export default function PatientRecordsTable({ records, appointments, onEdit, onDelete }: {
  records: MedicalRecord[],
  appointments: Appointment[],
  onEdit: (r: MedicalRecord) => void,
  onDelete: (r: MedicalRecord) => void,
}) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead>Resumen</TableHead>
            <TableHead>Cita relacionada</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="py-4 text-center">
              No hay registros
            </TableCell>
          </TableRow>
        ) : (
          records.map((r) => {
            const appt = appointments.find(a => a.medicalRecordId === r.recordId)
            return (
              <TableRow key={r.recordId}>
                <TableCell>{r.summary}</TableCell>
                <TableCell>{appt ? format(new Date(appt.scheduledStart), 'dd/MM/yyyy HH:mm') : '-'}</TableCell>
                <TableCell className="flex gap-2">
                  <button onClick={() => onEdit(r)} className="cursor-pointer"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(r)} className="cursor-pointer"><Trash size={16} /></button>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
    </div>
  )
}
