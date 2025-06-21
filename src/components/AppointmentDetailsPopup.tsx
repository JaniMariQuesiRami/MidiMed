'use client'
import { Appointment } from '@/types/db'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateAppointment } from '@/db/appointments'
import { toast } from 'sonner'

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
  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    if (appointment) {
      setDate(appointment.scheduledStart.slice(0, 10))
      setTime(appointment.scheduledStart.slice(11, 16))
      setEditing(false)
    }
  }, [appointment])

  if (!appointment) return null

  const save = async () => {
    const start = new Date(`${date}T${time}`)
    const duration =
      new Date(appointment.scheduledEnd).getTime() -
      new Date(appointment.scheduledStart).getTime()
    const end = new Date(start.getTime() + duration)
    try {
      await updateAppointment(appointment.appointmentId, {
        ...appointment,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      })
      const updated = {
        ...appointment,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
      }
      onUpdated?.(updated)
      toast.success('Cita actualizada')
      setEditing(false)
    } catch {
      toast.error('Error al actualizar cita')
    }
  }

  const cancelAppt = async () => {
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
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Popup onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium mb-2">Detalle de cita</h3>
        <p>
          <b>Paciente:</b>{' '}
          {patientName ? (
            <a
              href={`/patients/${appointment.patientId}`}
              className="text-primary underline"
            >
              {patientName}
            </a>
          ) : (
            appointment.patientId
          )}
        </p>
        {editing ? (
          <div className="space-y-2 mt-2">
            <div className="flex gap-2">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save}>Guardar</Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {appointment.reason && (
              <p>
                <b>Notas:</b> {appointment.reason}
              </p>
            )}
            <p>
              <b>Inicio:</b>{' '}
              {format(new Date(appointment.scheduledStart), 'dd/MM/yyyy HH:mm')}
            </p>
            <p>
              <b>Fin:</b> {format(new Date(appointment.scheduledEnd), 'dd/MM/yyyy HH:mm')}
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={() => setEditing(true)}>Editar</Button>
              <Button size="sm" variant="destructive" onClick={cancelAppt}>Cancelar</Button>
              <Button size="sm" variant="secondary" onClick={onClose}>Cerrar</Button>
            </div>
          </>
        )}
      </Popup>
    </Overlay>
  )
}

const Overlay = tw.div`fixed inset-0 bg-black/40 flex items-center justify-center z-50`
const Popup = tw.div`bg-white dark:bg-background rounded-md p-4 shadow-lg`
