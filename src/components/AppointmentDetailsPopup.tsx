'use client'

import { Appointment } from '@/types/db'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { updateAppointment } from '@/db/appointments'
import { toast } from 'sonner'
import { CalendarDays, Clock, FileText, User, X, AlertCircle } from 'lucide-react'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'


export default function AppointmentDetailsPopup({
  appointment,
  patientName,
  onClose,
  onUpdated,
}: {
  appointment: Appointment | null
  patientName?: string
  onClose: () => void
  onUpdated?: (appt: Appointment) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  if (!appointment) return null

  const cancelAppt = async () => {
    setCancelLoading(true)
    try {
      await updateAppointment(appointment.appointmentId, {
        ...appointment,
        status: 'cancelled',
      })
      onUpdated?.({ ...appointment, status: 'cancelled' })
      toast.success('Cita cancelada')
      onClose()
    } catch {
      toast.error('No se pudo cancelar')
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <PopupCard onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-primary w-5 h-5" />
            <span className="font-semibold text-lg">Detalle de cita</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted text-muted-foreground focus:outline-none">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="font-medium">Paciente:</span>
            {patientName ? (
              <a
                href={`/patients/${appointment.patientId}`}
                className="text-primary underline hover:text-primary/80 transition"
              >
                {/* Remove hour prefix if present */}
                {patientName.replace(/^\d{2}:\d{2} - /, '')}
              </a>
            ) : (
              <span className="text-muted-foreground">{appointment.patientId}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium">Inicio:</span>
            <span>{format(new Date(appointment.scheduledStart), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary opacity-70" />
            <span className="font-medium">Fin:</span>
            <span>{format(new Date(appointment.scheduledEnd), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          {appointment.reason && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium">Notas:</span>
              <span className="text-muted-foreground">{appointment.reason}</span>
            </div>
          )}
          {appointment.status && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <span className={
                appointment.status === 'cancelled'
                  ? 'text-destructive'
                  : appointment.status === 'scheduled'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }>
                {appointment.status === 'cancelled'
                  ? 'Cancelada'
                  : appointment.status === 'scheduled'
                  ? 'Agendada'
                  : appointment.status}
              </span>
              {appointment.status === 'cancelled' && (
                <>
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">Esta cita está cancelada</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2 mt-4 justify-end">
          <Button size="sm" onClick={() => setEditOpen(true)} disabled={appointment.status === 'cancelled'}>
            Editar
          </Button>
          <Button size="sm" variant="destructive" onClick={cancelAppt} disabled={appointment.status === 'cancelled' || cancelLoading}>
            {cancelLoading ? 'Cancelando...' : 'Cancelar'}
          </Button>
        </div>
        <CreateAppointmentModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          appointment={appointment}
          onUpdated={appt => {
            setEditOpen(false)
            onUpdated?.(appt)
          }}
          patientId={appointment.patientId}
          initialDate={new Date(appointment.scheduledStart)}
          initialStart={new Date(appointment.scheduledStart)}
        />
      </PopupCard>
    </Overlay>
  )
}

const Overlay = tw.div`fixed inset-0 bg-black/40 flex items-center justify-center z-50`
const PopupCard = tw.div`
  bg-white dark:bg-background rounded-xl p-6 shadow-2xl w-full max-w-md
  border border-border
  animate-fadeIn
`
