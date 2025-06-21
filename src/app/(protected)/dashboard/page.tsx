'use client'
import { useEffect, useState } from 'react'
import { Calendar, View, dateFnsLocalizer } from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import tw from 'tailwind-styled-components'
import { getPatients } from '@/db/patients'
import { getAppointmentsInRange } from '@/db/appointments'
import CreateAppointmentModal from '@/components/CreateAppointmentModal'
import AppointmentDetailsPopup from '@/components/AppointmentDetailsPopup'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { Patient, Appointment } from '@/types/db'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

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
  const [view, setView] = useState<View | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientFilter, setPatientFilter] = useState('')
  const [events, setEvents] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Appointment | null>(null)

  useEffect(() => {
    const isMobile = window.innerWidth < 640
    setView(isMobile ? 'day' : 'month')
    getPatients().then(setPatients).catch(() => {})
  }, [])

  useEffect(() => {
    if (!view) return
    const start = new Date()
    start.setDate(1)
    const end = new Date(start)
    end.setMonth(start.getMonth() + 1)
    getAppointmentsInRange(start, end, patientFilter || undefined)
      .then((list) =>
        setEvents(
          list.map((a) => ({
            start: new Date(a.scheduledStart),
            end: new Date(a.scheduledEnd),
            title: a.patientId,
            resource: a,
          }))
        )
      )
      .catch(() => {})
  }, [view, patientFilter])

  const todayStr = format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })
  const title = todayStr.charAt(0).toUpperCase() + todayStr.slice(1)

  if (!view) return null

  return (
    <Wrapper>
      <Header>
        <DateTitle>{title}</DateTitle>
        <div className="flex items-center gap-2 ml-auto">
          <Select value={patientFilter} onValueChange={setPatientFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {patients.map((p) => (
                <SelectItem key={p.patientId} value={p.patientId}>
                  {p.firstName} {p.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            className="bg-primary text-white px-3 py-1 rounded"
            onClick={() => setOpen(true)}
          >
            Nueva cita
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
          <Calendar
            culture="es"
            localizer={localizer}
            events={events}
            defaultView={view}
            view={view}
            onView={setView}
            onSelectEvent={(e) => setSelected(e.resource as Appointment)}
            style={{ height: 'calc(100vh - 150px)' }}
            selectable
            components={{ toolbar: () => null }}
          />
        </div>
      </div>
      <CreateAppointmentModal open={open} onClose={() => setOpen(false)} />
      <AppointmentDetailsPopup appointment={selected} onClose={() => setSelected(null)} />
    </Wrapper>
  )
}

// Styled components
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
