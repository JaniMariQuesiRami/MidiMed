'use client'
import { useContext, useEffect, useState, useMemo } from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, User, CheckCircle, Stethoscope, Info, Plus } from 'lucide-react'
import tw from 'tailwind-styled-components'
import { UserContext } from '@/contexts/UserContext'
import { getAppointmentsInRange } from '@/db/appointments'
import { getPatients, getMedicalRecords } from '@/db/patients'
import type { Patient, Appointment, MedicalRecord } from '@/types/db'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import MedicalRecordFormModal from './MedicalRecordFormModal'
import AppointmentDetailsPopup from './AppointmentDetailsPopup'
import CreateAppointmentModal from './CreateAppointmentModal'
import PatientSummaryModal from './PatientSummaryModal'

export default function MobileHomeDashboard() {
  const { user, tenant } = useContext(UserContext)
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending')
  const [openRecord, setOpenRecord] = useState(false)
  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [selectedPatientSummary, setSelectedPatientSummary] = useState<{
    summary?: string
    patientName?: string
  } | null>(null)

  const today = useMemo(() => new Date(), [])
  const todayStr = format(today, 'EEEE d \'de\' MMMM', { locale: es })
  
  // Reactivo al cambio del usuario
  const firstName = useMemo(() => {
    return user?.displayName?.split(' ')[0] || 'Doctor'
  }, [user?.displayName])

  useEffect(() => {
    if (!tenant) return
    
    const loadData = async () => {
      try {
        const [appointmentsData, patientsData] = await Promise.all([
          getAppointmentsInRange(
            startOfDay(today),
            endOfDay(today),
            undefined,
            tenant.tenantId
          ),
          getPatients(tenant.tenantId)
        ])
        
        setTodayAppointments(appointmentsData)
        setPatients(patientsData)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant, today])

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId)
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente no encontrado'
  }

  const getPatientSummary = (patientId: string) => {
    const patient = patients.find(p => p.patientId === patientId)
    return patient?.summary || undefined
  }

  const getNextAppointment = () => {
    const now = new Date()
    const upcomingAppointments = todayAppointments
      .filter(apt => new Date(apt.scheduledStart) > now && apt.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
    
    return upcomingAppointments[0] || null
  }

  const filteredAppointments = todayAppointments.filter(apt => {
    if (filter === 'pending') {
      return apt.status === 'scheduled'
    }
    return apt.status === 'completed'
  })

  const markAsCompleted = async (appointmentId: string) => {
    const appointment = todayAppointments.find(apt => apt.appointmentId === appointmentId)
    if (!appointment) return

    // Abrir modal de registro médico en lugar de completar directamente
    setCompletingAppt(appointment)
    setOpenRecord(true)
  }

  const nextAppointment = getNextAppointment()
  const totalTodayAppointments = todayAppointments.length;
  const pendingCount = todayAppointments.filter(apt => apt.status === 'scheduled').length;
  const completedCount = todayAppointments.filter(apt => apt.status === 'completed').length;
  const now = new Date();
  const allCompletedOrPast = todayAppointments.length > 0 && todayAppointments.every(apt => apt.status === 'completed' || new Date(apt.scheduledStart) < now);

  if (loading) {
    return (
      <div className="p-4 flex justify-center md:hidden">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    );
  }

  // Texto para "Hoy tienes..." o "Hoy tuviste..." y saludo
  let appointmentText = '';
  let greetingText = '';
  if (!allCompletedOrPast) {
    appointmentText = `Hoy tuviste ${totalTodayAppointments} ${totalTodayAppointments === 1 ? 'cita' : 'citas'}`;
    greetingText = `¡Buen trabajo, ${firstName}!`;
  } else {
    appointmentText = `Hoy tienes ${totalTodayAppointments} ${totalTodayAppointments === 1 ? 'cita' : 'citas'}`;
    greetingText = `Hola, ${firstName}`;
  }

  return (
    <Container>
      {/* Home Header Card */}
      <HeaderCard>
        <CardContent>
          <div className="flex-1">
            <Greeting>{greetingText}</Greeting>
            <DateText>{todayStr}</DateText>
            <AppointmentCount>{appointmentText}</AppointmentCount>
            {nextAppointment && !allCompletedOrPast && (
              <NextAppointment>
                <NextLabel>Tu próxima cita</NextLabel>
                <NextDetails>
                  {format(new Date(nextAppointment.scheduledStart), 'd MMM, h:mm a', { locale: es })} - {getPatientName(nextAppointment.patientId)}
                </NextDetails>
              </NextAppointment>
            )}
          </div>
          <CalendarIconWrapper>
            <Stethoscope size={24} className="text-white" />
          </CalendarIconWrapper>
        </CardContent>
      </HeaderCard>

      {/* Today's Appointments Section */}
      <Section>
        <SectionTitle className="flex items-center justify-between">
          <span>Citas de hoy</span>
          <button
            className="flex items-center gap-1 text-primary font-medium text-sm hover:underline px-2 rounded transition cursor-pointer"
            onClick={() => setOpenCreate(true)}
            type="button"
          >
            <Plus size={16} /> Crear cita
          </button>
        </SectionTitle>
        
        <SegmentedControl>
          <SegmentButton 
            $active={filter === 'pending'} 
            onClick={() => setFilter('pending')}
          >
            Pendientes
            <CountBadge $active={filter === 'pending'}>{pendingCount}</CountBadge>
          </SegmentButton>
          <SegmentButton 
            $active={filter === 'completed'} 
            onClick={() => setFilter('completed')}
          >
            Completadas
            <CountBadge $active={filter === 'completed'}>{completedCount}</CountBadge>
          </SegmentButton>
        </SegmentedControl>

        <AppointmentsList>
          {filteredAppointments.length === 0 ? (
            <EmptyState>
              {filter === 'pending' ? 'No hay citas pendientes' : 'No hay citas completadas'}
            </EmptyState>
          ) : (
            filteredAppointments.map((appointment) => (
              <AppointmentItem key={appointment.appointmentId}>
                <TimeSlot>
                  <Clock size={16} />
                  {format(new Date(appointment.scheduledStart), 'HH:mm')}
                </TimeSlot>
                
                <PatientInfo>
                  <User size={16} />
                  <PatientName>{getPatientName(appointment.patientId)}</PatientName>
                </PatientInfo>

                <ActionButtons>
                  <InfoButton onClick={() => setSelectedAppointment(appointment)}>
                    <Info size={16} />
                   Información
                  </InfoButton>
                  {appointment.status === 'scheduled' && (
                    <CompleteButton onClick={() => markAsCompleted(appointment.appointmentId)}>
                      <CheckCircle size={16} />
                      Marcar completada
                    </CompleteButton>
                  )}
                </ActionButtons>
              </AppointmentItem>
            ))
          )}
        </AppointmentsList>
      </Section>

      {/* Modal de registro médico */}
      {(completingAppt || viewingRecord) && (
        <MedicalRecordFormModal
          open={openRecord}
          onClose={() => {
            setOpenRecord(false)
            setCompletingAppt(null)
            setViewingRecord(null)
          }}
          patientId={completingAppt?.patientId || viewingRecord?.patientId || ''}
          appointmentId={completingAppt?.appointmentId}
          patientBirthDate={
            completingAppt
              ? patients.find(p => p.patientId === completingAppt.patientId)?.birthDate || ''
              : patients.find(p => p.patientId === viewingRecord?.patientId)?.birthDate || ''
          }
          record={viewingRecord}
          onCreated={(record) => {
            if (completingAppt) {
              // Actualizar la cita como completada y asociar el registro médico
              setTodayAppointments(prev => 
                prev.map(apt => 
                  apt.appointmentId === completingAppt.appointmentId 
                    ? { ...apt, status: 'completed', medicalRecordId: record.recordId }
                    : apt
                )
              )
              toast.success('Cita completada y registro médico creado')
            }
            setOpenRecord(false)
            setCompletingAppt(null)
            setViewingRecord(null)
          }}
          onUpdated={() => {
            setOpenRecord(false)
            setViewingRecord(null)
          }}
        />
      )}

      {/* Modal de detalles de cita */}
      {selectedAppointment && (
        <AppointmentDetailsPopup
          appointment={selectedAppointment}
          patientName={getPatientName(selectedAppointment.patientId)}
          onClose={() => setSelectedAppointment(null)}
          onUpdated={(updatedAppointment) => {
            setTodayAppointments(prev => 
              prev.map(apt => 
                apt.appointmentId === updatedAppointment.appointmentId 
                  ? updatedAppointment
                  : apt
              )
            )
            setSelectedAppointment(null)
          }}
          onViewRecord={async (recordId) => {
            if (!tenant) return
            try {
              // Buscar el paciente para obtener sus registros
              const patientId = selectedAppointment.patientId
              const patientRecords = await getMedicalRecords(patientId, tenant.tenantId)
              const record = patientRecords.find(r => r.recordId === recordId)
              if (record) {
                setViewingRecord(record)
                setSelectedAppointment(null)
                setOpenRecord(true)
              }
            } catch {
              toast.error('Error al cargar el registro médico')
            }
          }}
          onComplete={(appointment) => {
            setSelectedAppointment(null)
            setCompletingAppt(appointment)
            setOpenRecord(true)
          }}
          onViewPatientSummary={(patientId) => {
            const summary = getPatientSummary(patientId)
            const patientName = getPatientName(patientId)
            setSelectedPatientSummary({ summary, patientName })
            setSummaryOpen(true)
          }}
        />
      )}

      {/* Modal de AI Insight */}
      <PatientSummaryModal
        open={summaryOpen}
        onClose={() => {
          setSummaryOpen(false)
          setSelectedPatientSummary(null)
        }}
        patientSummary={selectedPatientSummary?.summary}
        patientName={selectedPatientSummary?.patientName}
      />

      {/* Modal de creación de cita */}
      <CreateAppointmentModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        initialDate={today}
        onCreated={() => {
          setOpenCreate(false)
          // Recargar citas del día
          if (tenant) {
            getAppointmentsInRange(
              startOfDay(today),
              endOfDay(today),
              undefined,
              tenant.tenantId
            ).then(setTodayAppointments)
          }
        }}
      />
    </Container>
  )
}

// Badge para contador de citas
const CountBadge = tw.span<{ $active?: boolean }>`
  ml-2 px-1 rounded-[4px] border text-xs font-semibold
  ${({ $active }) =>
    $active
      ? 'border-current text-current'
      : 'border-muted-foreground text-muted-foreground'}
`

// Styled Components
const Container = tw.div`
  md:hidden space-y-4 p-4
`

const HeaderCard = tw.div`
  bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg
`

const CardContent = tw.div`
  flex items-start justify-between
`

const Greeting = tw.h2`
  text-xl font-bold mb-1 text-primary-foreground/90
`

const DateText = tw.p`
  text-primary-foreground/90 text-sm mb-3 capitalize
`

const AppointmentCount = tw.p`
  text-primary-foreground/90 text-sm mb-3
`

const NextAppointment = tw.div`
  space-y-1
`

const NextLabel = tw.p`
  text-primary-foreground/90 text-xs font-medium
`

const NextDetails = tw.p`
  text-white text-sm font-medium
`

const CalendarIconWrapper = tw.div`
  w-12 h-12 bg-white/20 dark:bg-background/20 rounded-full flex items-center justify-center
`

const Section = tw.div`
  space-y-2
`

const SectionTitle = tw.h3`
  text-lg font-semibold text-foreground
`

const SegmentedControl = tw.div`
  flex bg-muted rounded-lg p-1
`

const SegmentButton = tw.button<{ $active: boolean }>`
  flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all cursor-pointer
  ${({ $active }) => 
    $active 
      ? 'bg-primary text-primary-foreground shadow-sm' 
      : 'text-muted-foreground hover:text-foreground'
  }
`

const AppointmentsList = tw.div`
  space-y-3 min-h-[50dvh]
`

const EmptyState = tw.div`
  text-center py-8 text-muted-foreground
`

const AppointmentItem = tw.div`
  bg-card rounded-xl border p-4 space-y-3 shadow-sm
`

const TimeSlot = tw.div`
  flex items-center gap-2 text-primary font-semibold
`

const PatientInfo = tw.div`
  flex items-center gap-2 text-foreground
`

const PatientName = tw.span`
  font-medium
`

const ActionButtons = tw.div`
  flex gap-2
`

const InfoButton = tw.button`
  flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer
  hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-700
`

const CompleteButton = tw.button`
  flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer
  hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors border border-green-200 dark:border-green-700
`
