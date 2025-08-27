'use client'

import { Appointment } from '@/types/db'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { useState, useEffect, useContext, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { updateAppointment } from '@/db/appointments'
import { completeOnboardingStep } from '@/db/onboarding'
import { UserContext } from '@/contexts/UserContext'
import { useHighlight } from '@/hooks/useHighlight'
import { toast } from 'sonner'
import { CalendarDays, Clock, FileText, User, X, AlertCircle, CheckCircle, Calendar, Sparkles, Download } from 'lucide-react'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import { useAppointmentReport } from '@/hooks/useAppointmentReport'


export default function AppointmentDetailsPopup({
  appointment,
  patientName,
  onClose,
  onUpdated,
  onViewRecord,
  onViewPatientSummary,
  onComplete,
  fromOnboarding = false,
  highlightComplete = false,
}: {
  appointment: Appointment | null
  patientName?: string
  onClose: () => void
  onUpdated?: (appt: Appointment) => void
  onViewRecord?: (recordId: string) => void
  onViewPatientSummary?: (patientId: string) => void
  onComplete?: (appt: Appointment) => void
  fromOnboarding?: boolean
  highlightComplete?: boolean
}) {
  const { tenant } = useContext(UserContext)
  const { highlight, removeHighlight } = useHighlight()
  const completeButtonRef = useRef<HTMLButtonElement>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [uncancelLoading, setUncancelLoading] = useState(false)
  const { getReportForAppointment } = useAppointmentReport()
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const [reportLoading, setReportLoading] = useState(false)

  // Marcar paso del onboarding como completado cuando se abra desde el onboarding
  useEffect(() => {
    if (fromOnboarding && appointment && tenant?.tenantId) {
      if (highlightComplete) {
        // Si viene para completar appointment, marcar ese paso
        completeOnboardingStep(tenant.tenantId, 'completeAppointment')
          .then(() => {
            console.log('Paso completeAppointment marcado como completado')
          })
          .catch((error) => {
            console.error('Error al marcar paso como completado:', error)
          })
      } else {
        // Si viene para ver appointment, marcar ese paso
        completeOnboardingStep(tenant.tenantId, 'viewAppointmentInfo')
          .then(() => {
            console.log('Paso viewAppointmentInfo marcado como completado')
          })
          .catch((error) => {
            console.error('Error al marcar paso como completado:', error)
          })
      }
    }
  }, [fromOnboarding, appointment, tenant?.tenantId, highlightComplete])

  // Resaltar el botón de completar cuando se necesite
  useEffect(() => {
    if (highlightComplete) {
      highlight({ elementId: 'complete-appointment-btn' })
    }
    
    // Cleanup cuando el componente se desmonte o highlightComplete cambie
    return () => {
      removeHighlight()
    }
  }, [highlightComplete, highlight, removeHighlight])

  useEffect(() => {
    if (appointment?.status === 'completed') {
      setReportLoading(true)
      getReportForAppointment(appointment)
        .then((reportData) => {
          setReportUrl(reportData.downloadUrl)
        })
        .catch((error) => {
          console.error('Error fetching report:', error)
          setReportUrl(null)
        })
        .finally(() => {
          setReportLoading(false)
        })
    }
  }, [appointment, getReportForAppointment])

  const handleDownloadRecipe = () => {
    if (reportUrl) {
      // Open in new tab so user doesn't lose current context
      window.open(reportUrl, '_blank')
    } else {
      toast.error('No hay receta disponible para descargar')
    }
  }

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
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
        status: 'cancelled',
        reason: appointment.reason,
        medicalRecordId: appointment.medicalRecordId ?? null,
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

  const uncancelAppt = async () => {
    setUncancelLoading(true)
    try {
      await updateAppointment(appointment.appointmentId, {
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        scheduledStart: appointment.scheduledStart,
        scheduledEnd: appointment.scheduledEnd,
        status: 'scheduled',
        reason: appointment.reason,
        medicalRecordId: appointment.medicalRecordId ?? null,
      })
      onUpdated?.({ ...appointment, status: 'scheduled' })
      toast.success('Cita reactivada')
      onClose()
    } catch {
      toast.error('No se pudo reactivar')
    } finally {
      setUncancelLoading(false)
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
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted text-muted-foreground focus:outline-none cursor-pointer">
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
        {/* Primera fila - Botones de visualización */}
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
          {appointment.status === 'completed' && (reportUrl || reportLoading) && (
            <Button 
              size="sm" 
              variant="outline"
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleDownloadRecipe}
              disabled={reportLoading || !reportUrl}
              title={reportUrl ? 'Abrir receta en nueva pestaña' : 'Cargando receta...'}
            >
              <Download className="w-4 h-4" />
              {reportLoading ? 'Cargando...' : 'Descargar receta'}
            </Button>
          )}
        </div>
        
        {/* Segunda fila - Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          {appointment.status === 'scheduled' && !appointment.medicalRecordId && onComplete && (
            <Button 
              id="complete-appointment-btn"
              ref={completeButtonRef}
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => onComplete(appointment)}
            >
              Completar cita
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setEditOpen(true)} 
            disabled={appointment.status === 'cancelled'}
          >
            Editar
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            className="w-full sm:w-auto"
            onClick={cancelAppt} 
            disabled={appointment.status === 'cancelled' || cancelLoading}
          >
            {cancelLoading ? 'Cancelando...' : 'Cancelar'}
          </Button>
          {appointment.status === 'cancelled' && (
            <Button
              size="sm"
              className="w-full sm:w-auto"
              onClick={uncancelAppt}
              disabled={uncancelLoading}
            >
              {uncancelLoading ? 'Reactivando...' : 'Reactivar'}
            </Button>
          )}
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
