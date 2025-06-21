'use client'
import { Appointment } from '@/types/db'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'

export default function AppointmentDetailsPopup({
  appointment,
  onClose,
}: {
  appointment: Appointment | null
  onClose: () => void
}) {
  if (!appointment) return null
  return (
    <Overlay onClick={onClose}>
      <Popup onClick={(e) => e.stopPropagation()}>
        <h3 className="font-medium mb-2">Detalle de cita</h3>
        <p>
          <b>Paciente:</b> {appointment.patientId}
        </p>
        <p>
          <b>Inicio:</b>{' '}
          {format(new Date(appointment.scheduledStart), 'dd/MM/yyyy HH:mm')}
        </p>
        <p>
          <b>Fin:</b> {format(new Date(appointment.scheduledEnd), 'dd/MM/yyyy HH:mm')}
        </p>
        <button className="mt-3 text-primary" onClick={onClose}>
          Cerrar
        </button>
      </Popup>
    </Overlay>
  )
}

const Overlay = tw.div`fixed inset-0 bg-black/40 flex items-center justify-center z-50`
const Popup = tw.div`bg-white dark:bg-background rounded-md p-4 shadow-lg`
