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
import PatientAutocomplete from '@/components/PatientAutocomplete'
import type { Patient, Appointment } from '@/types/db'
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
  const [patientFilter, setPatientFilter] = useState('all')
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
    const filterId = patientFilter === "all" ? undefined : patientFilter
    console.log("Tenant ID:", tenant.tenantId)
    console.log("Date Range:", start, end)
    const list = await getAppointmentsInRange(
      start,
      end,
      filterId,
      tenant.tenantId,
    )
    setEvents(
      list.map((a) => ({
        start: new Date(a.scheduledStart),
        end: new Date(a.scheduledEnd),
        title: `${format(new Date(a.scheduledStart), 'HH:mm')} - ${nameMap.get(a.patientId) ?? a.patientId}`,
        resource: a,
      }))
    )
  }, [view, patients, tenant, date, patientFilter])

  useEffect(() => {
    const isMobile = window.innerWidth < 640
    setView(isMobile ? 'day' : 'month')
  }, [])

  useEffect(() => {
    if (!tenant) return
    getPatients(tenant.tenantId).then(setPatients).catch(() => { })
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
    <Wrapper>
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
            className="ml-2 px-3 py-1 rounded bg-primary text-white font-medium text-sm hover:bg-primary/90 transition"
            onClick={() => setDate(new Date())}
            type="button"
          >
            Ir a hoy
          </button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <PatientAutocomplete
            patients={patients}
            value={patientFilter}
            onChange={(v) => setPatientFilter(v || 'all')}
          />
          <button
            className="bg-primary text-white px-3 py-1 rounded flex items-center gap-1"
            onClick={() => {
              setSlotDate(new Date())
              setSlotStart(null)
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
            onSelectEvent={(event: object, _e?: React.SyntheticEvent) => {
              const e = event as CalendarEvent
              setSelected({ appt: e.resource, name: e.title })
            }}
            onSelectSlot={(slot) => {
              setSlotDate(slot.start)
              setSlotStart(view === 'month' ? null : slot.start)
              setOpen(true)
            }}
            style={{ height: 'calc(100vh - 150px)' }}
            selectable
            components={{
              toolbar: () => null,
              event: ({ event }) => {
                // Only show patient name (no hour) in week view
                // event.title is "HH:mm - Nombre Paciente" or just "Nombre Paciente"
                // event can be CalendarEvent or raw event object
                const title = (event && typeof event === 'object' && 'title' in event) ? (event as any).title : '';
                let name = title;
                if (view === 'week' || view === 'day') {
                  // Remove hour prefix if present
                  name = name.replace(/^\d{2}:\d{2} - /, '');
                }
                return (
                  <div className="font-semibold text-white text-sm px-1 truncate" style={{lineHeight:'1.2'}}>{name}</div>
                );
              }
            }}
          />
        </div>
      </div>
      <CreateAppointmentModal
        open={open}
        onClose={() => {
          setOpen(false)
          setSlotDate(null)
          setSlotStart(null)
        }}
        onCreated={() => loadEvents()}
        initialDate={slotDate}
        initialStart={slotStart}
        patientId={patientFilter !== 'all' ? patientFilter : undefined}
      />
      <AppointmentDetailsPopup
        appointment={selected?.appt || null}
        patientName={selected?.name}
        onClose={() => setSelected(null)}
        onUpdated={() => loadEvents()}
      />
    </Wrapper>
  )
}

// Styled components
const ModernCalendar = tw(Calendar)`bg-white rounded-2xl shadow-sm p-2`;
const Wrapper = tw.div`flex flex-col gap-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 bg-white px-2 sm:px-4 py-2 gap-2`
const DateTitle = tw.h1`text-lg font-semibold w-full sm:w-auto`
const ViewSwitcher = tw.div`flex gap-2 sm:flex`
const SwitchButton = tw.button<{ $active: boolean }>`
  px-3 py-1 rounded hidden sm:block
  ${({ $active }) =>
    $active
      ? 'bg-primary text-white'
      : 'bg-secondary text-secondary-dark'}
  hover:opacity-80
`

const IconButton = tw.button`p-1 rounded hover:bg-muted text-muted-foreground`
