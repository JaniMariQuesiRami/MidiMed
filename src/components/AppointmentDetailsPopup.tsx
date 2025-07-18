'use client'

import { Appointment } from '@/types/db'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { updateAppointment } from '@/db/appointments'
import { toast } from 'sonner'
import { CalendarDays, Clock, FileText, User, X, AlertCircle, CheckCircle, Calendar, Sparkles } from 'lucide-react'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'


export default function AppointmentDetailsPopup({
  appointment,
  patientName,
  onClose,
  onUpdated,
  onViewRecord,
  onViewPatientSummary,
}: {
  appointment: Appointment | null
  patientName?: string
  onClose: () => void
  onUpdated?: (appt: Appointment) => void
  onViewRecord?: (recordId: string) => void
  onViewPatientSummary?: (patientId: string) => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  if (!appointment) return null

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          text: 'Agendada',
          className: 'text-primary',
          icon: <Calendar className="w-4 h-4 text-primary" />
        }
      case 'completed':
        return {
          text: 'Completada',
          className: 'text-green-600',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />
        }
      case 'cancelled':
        return {
          text: 'Cancelada',
          className: 'text-destructive',
          icon: <AlertCircle className="w-4 h-4 text-destructive" />
        }
      default:
        return {
          text: status,
          className: 'text-muted-foreground',
          icon: <Calendar className="w-4 h-4 text-muted-foreground" />
        }
    }
  }

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
            {patientName ? (
              <a
                href={`/patients/${appointment.patientId}`}
                className="text-primary underline hover:text-primary/80 transition font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.href = `/patients/${appointment.patientId}`
                }}
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
            <span>{format(new Date(appointment.scheduledStart), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary opacity-70" />
            <span>{format(new Date(appointment.scheduledEnd), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          {appointment.reason && (
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{appointment.reason}</span>
            </div>
          )}
          {appointment.status && (
            <div className="flex items-center gap-2">
              {getStatusInfo(appointment.status).icon}
              <span className={getStatusInfo(appointment.status).className}>
                {getStatusInfo(appointment.status).text}
              </span>
              {appointment.status === 'cancelled' && (
                <span className="text-destructive text-sm">Esta cita está cancelada</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {patientName && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                window.location.href = `/patients/${appointment.patientId}`
              }}
            >
              Ver perfil del paciente
            </Button>
          )}
          {patientName && onViewPatientSummary && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={() => onViewPatientSummary(appointment.patientId)}
            >
              <Sparkles className="w-4 h-4" />
              AI Insight
            </Button>
          )}
          {appointment.status === 'completed' && appointment.medicalRecordId && onViewRecord && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onViewRecord(appointment.medicalRecordId!)}
            >
              Ver registro médico
            </Button>
          )}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 sm:flex-none"
              onClick={() => setEditOpen(true)} 
              disabled={appointment.status === 'cancelled'}
            >
              Editar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1 sm:flex-none"
              onClick={cancelAppt} 
              disabled={appointment.status === 'cancelled' || cancelLoading}
            >
              {cancelLoading ? 'Cancelando...' : 'Cancelar'}
            </Button>
          </div>
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

const Overlay = tw.div`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4`
const PopupCard = tw.div`
  bg-white dark:bg-background rounded-xl p-6 shadow-2xl w-full max-w-md
  border border-border
  animate-fadeIn
  max-h-[90dvh] overflow-y-auto
`
