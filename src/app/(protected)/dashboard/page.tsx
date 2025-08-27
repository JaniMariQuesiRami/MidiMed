'use client'
import { useEffect, useState, useCallback, useContext, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Calendar, View, dateFnsLocalizer } from 'react-big-calendar'
import type { SlotInfo, EventProps as RBCEventProps, CalendarProps } from 'react-big-calendar'
import type { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import {
  format,
  parse,
  startOfWeek,
  getDay,
  startOfMonth,
  startOfDay,
  addMonths,
  addWeeks,
  addDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
// Custom calendar styles for a modern, borderless look
import '@/app/(protected)/dashboard/rbc-modern.css'
import tw from 'tailwind-styled-components'
import { getPatients } from '@/db/patients'
import { getAppointmentsInRange, updateAppointment } from '@/db/appointments'
import { completeOnboardingStep } from '@/db/onboarding'
import { UserContext } from '@/contexts/UserContext'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import AppointmentDetailsPopup from '@/components/AppointmentDetailsPopup'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import MultiSelectAutocomplete from '@/components/MultiSelectAutocomplete'
import MobileHomeDashboard from '@/components/MobileHomeDashboard'
import type { Patient, Appointment, User } from '@/types/db'
import { getUsersByTenant } from '@/db/users'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import WantsToBuyModal from '@/components/WantsToBuyModal'
import MedicalRecordFormModal from '@/components/MedicalRecordFormModal'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Calendar event type used across this file
type CalendarEvent = {
  start: Date
  end: Date
  title: string
  resource: Appointment
}

const locales = { es }
const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: es }),
  parse: (value: string, formatStr: string) =>
    parse(value, formatStr, new Date(), { locale: es }),
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
})

const views = [
  { key: 'month' as View, label: 'Mes' },
  { key: 'week' as View, label: 'Semana' },
  { key: 'day' as View, label: 'Día' },
]

// Component that handles search params (needs to be wrapped in Suspense)
function DashboardWithSearchParams() {
  const searchParams = useSearchParams()
  return <DashboardCalendar searchParams={searchParams} />
}

function DashboardCalendar({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const { tenant } = useContext(UserContext)
  const [view, setView] = useState<View | null>(null)
  const [date, setDate] = useState(new Date())
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [patientFilter, setPatientFilter] = useState<string[]>([])
  const [doctorFilter, setDoctorFilter] = useState<string[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [open, setOpen] = useState(false)
  const [slotDate, setSlotDate] = useState<Date | null>(null)
  const [slotStart, setSlotStart] = useState<Date | null>(null)
  const [slotEnd, setSlotEnd] = useState<Date | null>(null)
  const [selected, setSelected] = useState<{ appt: Appointment; name: string } | null>(null)
  const [fromOnboarding, setFromOnboarding] = useState(false)
  const [highlightComplete, setHighlightComplete] = useState(false)
  const [pendingChange, setPendingChange] = useState<{
    type: 'move' | 'resize'
    event: CalendarEvent
    start: Date
    end: Date
  } | null>(null)
  const [savingChange, setSavingChange] = useState(false)
  const [showWantsToBuyModal, setShowWantsToBuyModal] = useState(false)
  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null)
  const [openRecord, setOpenRecord] = useState(false)

  // Show wantsToBuy modal if user has a plan they want to buy
  useEffect(() => {
    if (tenant?.billing?.wantsToBuy && !showWantsToBuyModal) {
      setShowWantsToBuyModal(true)
    }
  }, [tenant?.billing?.wantsToBuy, showWantsToBuyModal])

  // Abrir modal automáticamente si viene del onboarding
  useEffect(() => {
    const modalParam = searchParams.get('modal')
    const actionParam = searchParams.get('action')
    
    if (modalParam === 'createAppointment') {
      setOpen(true)
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href)
      url.searchParams.delete('modal')
      window.history.replaceState({}, '', url)
    }

    // Manejar acción especial para ver el primer appointment
    if (actionParam === 'viewFirstAppointment' && events.length > 0) {
      const firstEvent = events[0]
      if (firstEvent.resource && patients.length > 0) {
        const patientName = patients.find(p => p.patientId === firstEvent.resource.patientId)
        if (patientName) {
          setSelected({
            appt: firstEvent.resource,
            name: `${patientName.firstName} ${patientName.lastName}`
          })
          setFromOnboarding(true) // Marcar que viene del onboarding
          // Limpiar el parámetro de la URL sin recargar
          const url = new URL(window.location.href)
          url.searchParams.delete('action')
          window.history.replaceState({}, '', url)
        }
      }
    }

    // Manejar acción especial para completar el primer appointment
    if (actionParam === 'completeFirstAppointment' && events.length > 0) {
      const firstEvent = events[0]
      if (firstEvent.resource && patients.length > 0) {
        const patientName = patients.find(p => p.patientId === firstEvent.resource.patientId)
        if (patientName) {
          setSelected({
            appt: firstEvent.resource,
            name: `${patientName.firstName} ${patientName.lastName}`
          })
          setFromOnboarding(true) // Marcar que viene del onboarding
          setHighlightComplete(true) // Marcar que se debe resaltar el botón de completar
          // Limpiar el parámetro de la URL sin recargar
          const url = new URL(window.location.href)
          url.searchParams.delete('action')
          window.history.replaceState({}, '', url)
        }
      }
    }
  }, [searchParams, events, patients])

  const navigate = (step: number) => {
    if (view === 'month') setDate((d) => addMonths(d, step))
    else if (view === 'week') setDate((d) => addWeeks(d, step))
    else setDate((d) => addDays(d, step))
  }

  const loadEvents = useCallback(async () => {
    if (!view || patients.length === 0 || !tenant) return
    let start: Date
    let end: Date
    if (view === 'month') {
      start = startOfMonth(date)
      end = addMonths(start, 1)
    } else if (view === 'week') {
      start = startOfWeek(date, { locale: es })
      end = addWeeks(start, 1)
    } else {
      start = startOfDay(date)
      end = addDays(start, 1)
    }
    const nameMap = new Map(
      patients.map((p) => [p.patientId, `${p.firstName} ${p.lastName}`]),
    )
    const list = await getAppointmentsInRange(
      start,
      end,
      patientFilter,
      tenant.tenantId,
      doctorFilter,
    )
    setEvents(
      list.map((a) => ({
        start: new Date(a.scheduledStart),
        end: new Date(a.scheduledEnd),
        title: `${format(new Date(a.scheduledStart), 'HH:mm')} - ${nameMap.get(a.patientId) ?? a.patientId}`,
        resource: a,
      }))
    )
  }, [view, patients, tenant, date, patientFilter, doctorFilter])

  useEffect(() => {
    const isMobile = window.innerWidth < 640
    setView(isMobile ? 'day' : 'month')
  }, [])

  useEffect(() => {
    if (!tenant) return
    Promise.all([
      getPatients(tenant.tenantId),
      getUsersByTenant(tenant.tenantId),
    ])
      .then(([patientsData, usersData]) => {
        setPatients(patientsData)
        const docs = usersData.filter((u) => u.role === 'admin' || u.role === 'provider')
        setDoctors(docs)
      })
      .catch(() => { })
  }, [tenant])

  useEffect(() => {
    if (patients.length > 0) {
      loadEvents().catch((err) => {
        console.error('Error loading events in UI:', err)
        toast.error('Error cargando citas')
      })
    }
  }, [loadEvents, patients])

  const todayStr = format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })
  const title = todayStr.charAt(0).toUpperCase() + todayStr.slice(1)

  if (!view)
    return (
      <div className="p-4 flex justify-center">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    )

  return (
    <>
      {/* Mobile Home Dashboard */}
      <MobileHomeDashboard />

      {/* Desktop Calendar View */}
      <DesktopWrapper>
        <Header>
          <DateTitle>{title}</DateTitle>
          <div className="flex gap-2 ml-auto sm:ml-0 items-center">
            <IconButton onClick={() => navigate(-1)}>
              <ChevronLeft size={20} />
            </IconButton>
            <IconButton onClick={() => navigate(1)}>
              <ChevronRight size={20} />
            </IconButton>
            <button
              className="ml-2 px-3 py-1 rounded bg-primary text-white font-medium text-sm hover:bg-primary/90 transition cursor-pointer"
              onClick={() => setDate(new Date())}
              type="button"
            >
              Hoy
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <MultiSelectAutocomplete
              items={patients.map((p) => ({ id: p.patientId, label: `${p.firstName} ${p.lastName}` }))}
              selected={patientFilter}
              onChange={setPatientFilter}
              placeholder="Filtrar pacientes..."
            />
            <MultiSelectAutocomplete
              items={doctors.map((d) => ({ id: d.uid, label: d.displayName }))}
              selected={doctorFilter}
              onChange={setDoctorFilter}
              placeholder="Filtrar doctores..."
            />
            <button
              id="create-appointment-btn"
              className="bg-primary text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
              onClick={() => {
                setSlotDate(new Date())
                setSlotStart(null)
                setSlotEnd(null)
                setOpen(true)
              }}
            >
              Nueva cita <Plus size={16} />
            </button>
          </div>
          <ViewSwitcher>
            {views.map(({ key, label }) => (
              <SwitchButton
                key={key}
                $active={view === key}
                onClick={() => setView(key)}
              >
                {label}
              </SwitchButton>
            ))}
          </ViewSwitcher>
        </Header>
        <div className="overflow-x-auto w-full">
          <div className="md:min-w-[700px] md:max-w-auto max-w-[100vw]">
            <DndProvider backend={HTML5Backend}>
            <div id="calendar-container">
            <DnDCalendar
              culture="es"
              localizer={localizer}
              events={events}
              defaultView={view}
              view={view}
              date={date}
              onNavigate={setDate}
              onView={setView}
              resizable
              className="bg-white dark:bg-background rounded-2xl shadow-sm p-2"
              onEventDrop={({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
                const startDate = start instanceof Date ? start : new Date(start)
                const endDate = end instanceof Date ? end : new Date(end)
                setPendingChange({ type: 'move', event, start: startDate, end: endDate })
              }}
              onEventResize={({ event, start, end }: EventInteractionArgs<CalendarEvent>) => {
                const startDate = start instanceof Date ? start : new Date(start)
                const endDate = end instanceof Date ? end : new Date(end)
                setPendingChange({ type: 'resize', event, start: startDate, end: endDate })
              }}
              onSelectEvent={(event: CalendarEvent) => {
                setSelected({ appt: event.resource, name: event.title })
                if (tenant && !tenant.onboarding?.viewAppointmentInfo) {
                  completeOnboardingStep(tenant.tenantId, 'viewAppointmentInfo').catch((err) =>
                    console.error('Error completing onboarding step viewAppointmentInfo:', err),
                  )
                }
              }}
              onSelectSlot={(slot: SlotInfo) => {
                const startDate = slot.start instanceof Date ? slot.start : new Date(slot.start)
                const endDate = slot.end instanceof Date ? slot.end : new Date(slot.end)
                setSlotDate(startDate)
                setSlotStart(view === 'month' ? null : startDate)
                setSlotEnd(view === 'month' ? null : endDate)
                setOpen(true)
              }}
              style={{ height: 'calc(100vh - 150px)' }}
              selectable
              draggableAccessor={() => true}
              resizableAccessor={() => true}
              eventPropGetter={(event: CalendarEvent) => {
                const e = event
                const color = doctors.find((d) => d.uid === e.resource.providerId)?.color || '#3abdd4'
                const isCancelled = e.resource.status === 'cancelled'
                return {
                  style: {
                    background: color,
                    borderRadius: '4px',
                    color: 'white',
                    border: 'none',
                    opacity: isCancelled ? 0.5 : 1,
                    filter: isCancelled ? 'grayscale(20%)' : undefined
                  }
                }
              }}
              messages={{
                showMore: (total: number) => `+${total} más`,
                previous: 'Anterior',
                next: 'Siguiente',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                allDay: 'Todo el día',
                work_week: 'Semana laboral',
                yesterday: 'Ayer',
                tomorrow: 'Mañana',
                noEventsInRange: 'No hay eventos en este rango de fechas.'
              }}
              components={{
    toolbar: () => null,
  event: (props: RBCEventProps<CalendarEvent>) => {
      const event = props.event;
                  // Only show patient name (no hour) in week view
                  // event.title is "HH:mm - Nombre Paciente" or just "Nombre Paciente"
                  let name = event.title;
                  if (view === 'week' || view === 'day') {
                    // Remove hour prefix if present
                    name = name.replace(/^\d{2}:\d{2} - /, '');
                  }
                  return (
          <div className={`font-semibold text-white text-sm px-1 truncate ${event.resource.status === 'cancelled' ? 'line-through' : ''}`} style={{ lineHeight: '1.2' }}>{name}</div>
                  );
                }
              }}
            />
            </div>
            </DndProvider>
          </div>
        </div>
      </DesktopWrapper>

      {/* Confirm move/resize dialog */}
      <Dialog open={!!pendingChange} onOpenChange={(v) => !v && setPendingChange(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingChange?.type === 'resize' ? 'Confirmar duración' : 'Confirmar reprogramación'}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-1">
                {pendingChange && (
                  <>
                    <p><span className="font-medium">Antes:</span> {format(pendingChange.event.start, "EEE d MMM yyyy HH:mm", { locale: es })} - {format(pendingChange.event.end, "HH:mm", { locale: es })}</p>
                    <p><span className="font-medium">Después:</span> {format(pendingChange.start, "EEE d MMM yyyy HH:mm", { locale: es })} - {format(pendingChange.end, "HH:mm", { locale: es })}</p>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPendingChange(null)} disabled={savingChange}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!pendingChange) return
                try {
                  setSavingChange(true)
                  const appt = pendingChange.event.resource
                  await updateAppointment(appt.appointmentId, {
                    patientId: appt.patientId,
                    providerId: appt.providerId,
                    scheduledStart: pendingChange.start.toISOString(),
                    scheduledEnd: pendingChange.end.toISOString(),
                    status: appt.status,
                    reason: appt.reason,
                    medicalRecordId: appt.medicalRecordId ?? null,
                  })
                  setPendingChange(null)
                  await loadEvents()
                  toast.success(pendingChange.type === 'resize' ? 'Cita actualizada' : 'Cita reprogramada')
                } catch (err) {
                  console.error('Error confirming change', err)
                  toast.error('No se pudo guardar cambios')
                } finally {
                  setSavingChange(false)
                }
              }}
              disabled={savingChange}
            >
              {savingChange ? 'Guardando…' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CreateAppointmentModal
        open={open}
        onClose={() => {
          setOpen(false)
          setSlotDate(null)
          setSlotStart(null)
          setSlotEnd(null)
        }}
        onCreated={() => loadEvents()}
        initialDate={slotDate}
        initialStart={slotStart}
        initialEnd={slotEnd}
        patientId={patientFilter.length === 1 ? patientFilter[0] : undefined}
      />
      <AppointmentDetailsPopup
        appointment={selected?.appt || null}
        patientName={selected?.name}
        onClose={() => {
          setSelected(null)
          setFromOnboarding(false) // Resetear flag cuando se cierre
          setHighlightComplete(false) // Resetear highlight cuando se cierre
        }}
        onUpdated={() => loadEvents()}
        fromOnboarding={fromOnboarding}
        highlightComplete={highlightComplete}
        onComplete={(appointment) => {
          setSelected(null)
          setFromOnboarding(false) // Resetear flag también cuando se complete
          setHighlightComplete(false) // Resetear highlight cuando se complete
          setCompletingAppt(appointment)
          setOpenRecord(true)
          if (tenant && !tenant.onboarding?.completeAppointment) {
            completeOnboardingStep(tenant.tenantId, 'completeAppointment').catch((err) =>
              console.error('Error completing onboarding step completeAppointment:', err),
            )
          }
        }}
      />

      {/* WantsToBuy Modal */}
      {tenant?.billing?.wantsToBuy && (
        <WantsToBuyModal
          isOpen={showWantsToBuyModal}
          onClose={() => setShowWantsToBuyModal(false)}
          planName={tenant.billing.wantsToBuy}
        />
      )}

      {/* Medical Record Modal for completing appointments */}
      <MedicalRecordFormModal
        open={openRecord}
        onClose={() => {
          setOpenRecord(false)
          setCompletingAppt(null)
        }}
        patientId={completingAppt?.patientId || ''}
        appointmentId={completingAppt?.appointmentId}
        patientBirthDate={patients.find(p => p.patientId === completingAppt?.patientId)?.birthDate || ''}
        onCreated={() => {
          if (completingAppt) {
            // Update the appointment as completed and refresh events
            loadEvents()
          }
          setOpenRecord(false)
          setCompletingAppt(null)
        }}
      />
    </>
  )
}

// Styled components
// Enable drag & drop by wrapping Calendar with proper generics
type RBCalendarComp = React.ComponentType<CalendarProps<CalendarEvent, object>>
const DnDCalendar = withDragAndDrop<CalendarEvent, object>(
  Calendar as unknown as RBCalendarComp
)
const DesktopWrapper = tw.div`hidden md:flex md:flex-col gap-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 bg-white dark:bg-background px-2 sm:px-4 py-2 gap-2`
const DateTitle = tw.h1`text-lg font-semibold w-full sm:w-auto`
const ViewSwitcher = tw.div`flex gap-2 sm:flex`
const SwitchButton = tw.button<{ $active: boolean }>`
  px-3 py-1 rounded hidden sm:block cursor-pointer
  ${({ $active }) =>
    $active
      ? 'bg-primary text-white'
      : 'bg-muted text-muted-foreground'}
  hover:opacity-80
`

const IconButton = tw.button`p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer`

// Default export with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardWithSearchParams />
    </Suspense>
  )
}
