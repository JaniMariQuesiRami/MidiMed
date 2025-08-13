'use client'
import { useEffect, useState, useCallback, useContext } from 'react'
import { Calendar, View, dateFnsLocalizer } from 'react-big-calendar'
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
import { getAppointmentsInRange } from '@/db/appointments'
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

export default function DashboardCalendar() {
  const { tenant } = useContext(UserContext)
  const [view, setView] = useState<View | null>(null)
  const [date, setDate] = useState(new Date())
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [patientFilter, setPatientFilter] = useState<string[]>([])
  const [doctorFilter, setDoctorFilter] = useState<string[]>([])
  type CalendarEvent = {
    start: Date
    end: Date
    title: string
    resource: Appointment
  }
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [open, setOpen] = useState(false)
  const [slotDate, setSlotDate] = useState<Date | null>(null)
  const [slotStart, setSlotStart] = useState<Date | null>(null)
  const [slotEnd, setSlotEnd] = useState<Date | null>(null)
  const [selected, setSelected] = useState<{ appt: Appointment; name: string } | null>(null)

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
              Ir a hoy
            </button>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <MultiSelectAutocomplete
              items={patients.map((p) => ({ id: p.patientId, label: `${p.firstName} ${p.lastName}` }))}
              selected={patientFilter}
              onChange={setPatientFilter}
              placeholder="Pacientes"
            />
            <MultiSelectAutocomplete
              items={doctors.map((d) => ({ id: d.uid, label: d.displayName }))}
              selected={doctorFilter}
              onChange={setDoctorFilter}
              placeholder="Doctores"
            />
            <button
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
            <ModernCalendar
              culture="es"
              localizer={localizer}
              events={events}
              defaultView={view}
              view={view}
              date={date}
              onNavigate={setDate}
              onView={setView}
              onSelectEvent={(event: object) => {
                const e = event as CalendarEvent
                setSelected({ appt: e.resource, name: e.title })
              }}
              onSelectSlot={(slot) => {
                setSlotDate(slot.start)
                setSlotStart(view === 'month' ? null : slot.start)
                setSlotEnd(view === 'month' ? null : slot.end)
                setOpen(true)
              }}
              style={{ height: 'calc(100vh - 150px)' }}
              selectable
              eventPropGetter={(event) => {
                const e = event as CalendarEvent
                const color = doctors.find((d) => d.uid === e.resource.providerId)?.color || '#2563eb'
                return {
                  style: {
                    backgroundColor: color,
                    borderRadius: '4px',
                    color: 'white',
                    border: 'none'
                  }
                }
              }}
              messages={{
                showMore: (total) => `+${total} más`,
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
                event: (props) => {
                  const event = props.event as CalendarEvent;
                  // Only show patient name (no hour) in week view
                  // event.title is "HH:mm - Nombre Paciente" or just "Nombre Paciente"
                  let name = event.title;
                  if (view === 'week' || view === 'day') {
                    // Remove hour prefix if present
                    name = name.replace(/^\d{2}:\d{2} - /, '');
                  }
                  return (
                    <div className="font-semibold text-white text-sm px-1 truncate" style={{ lineHeight: '1.2' }}>{name}</div>
                  );
                }
              }}
            />
          </div>
        </div>
      </DesktopWrapper>

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
        onClose={() => setSelected(null)}
        onUpdated={() => loadEvents()}
      />
    </>
  )
}

// Styled components
const ModernCalendar = tw(Calendar)`bg-white dark:bg-background rounded-2xl shadow-sm p-2`;
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
