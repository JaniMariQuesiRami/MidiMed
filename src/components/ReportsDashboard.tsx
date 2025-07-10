"use client"
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { getCompletedAppointmentsInRange } from '@/db/reports'
import { getPatients } from '@/db/patients'
import type { Appointment, Patient } from '@/types/db'
import { format, startOfWeek, addDays, startOfYear, addMonths, subMonths } from 'date-fns'
import tw from 'tailwind-styled-components'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Button } from '@/components/ui/button'
import html2pdf from 'html2pdf.js'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function ReportsDashboard() {
  const { tenant } = useContext(UserContext)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tenant) return
    const load = async () => {
      const appts = await getCompletedAppointmentsInRange(
        tenant.tenantId,
        subMonths(new Date(), 12),
        new Date(),
      )
      setAppointments(appts)
      const pats = await getPatients(tenant.tenantId)
      setPatients(pats)
    }
    load().catch(console.error)
  }, [tenant])

  const patientMap = useMemo(
    () => new Map(patients.map((p) => [p.patientId, p])),
    [patients],
  )

  const kpis = useMemo(() => {
    const total = appointments.length
    const cancelled = 0
    const avgPerDay = total / 90
    return {
      totalPatients: tenant?.counters.patients || 0,
      totalAppointments: total,
      completedAppointments: total,
      cancelledAppointments: cancelled,
      avgPerDay,
      totalRecords: tenant?.counters.medicalRecords || 0,
    }
  }, [appointments, tenant])

  const trends = useMemo(() => {
    if (appointments.length === 0) return { labels: [], data: [] }
    const map = new Map<string, number>()
    if (view === 'day') {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 })
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i)
        map.set(format(d, 'EEE'), 0)
      }
      appointments.forEach((a) => {
        const d = new Date(a.scheduledStart)
        const label = format(d, 'EEE')
        if (map.has(label)) map.set(label, (map.get(label) || 0) + 1)
      })
    } else if (view === 'week') {
      const start = subMonths(new Date(), 3)
      for (let i = 0; i < 12; i++) {
        const d = addDays(start, i * 7)
        const label = format(d, 'ww')
        map.set(label, 0)
      }
      appointments.forEach((a) => {
        const d = new Date(a.scheduledStart)
        const label = format(d, 'ww')
        if (map.has(label)) map.set(label, (map.get(label) || 0) + 1)
      })
    } else {
      const start = startOfYear(new Date())
      for (let i = 0; i < 12; i++) {
        const d = addMonths(start, i)
        map.set(format(d, 'MMM'), 0)
      }
      appointments.forEach((a) => {
        const d = new Date(a.scheduledStart)
        const label = format(d, 'MMM')
        if (map.has(label)) map.set(label, (map.get(label) || 0) + 1)
      })
    }
    return { labels: Array.from(map.keys()), data: Array.from(map.values()) }
  }, [appointments, view])

  const weekdayAvg = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]
    appointments.forEach((a) => {
      const d = new Date(a.scheduledStart)
      counts[d.getDay()]++
    })
    const weeks = 12
    return counts.map((c) => Math.round(c / weeks))
  }, [appointments])

  const topPatients = useMemo(() => {
    const mapC = new Map<string, { count: number; last: string }>()
    appointments.forEach((a) => {
      const existing = mapC.get(a.patientId)
      if (existing) {
        existing.count++
        if (existing.last < a.scheduledStart) existing.last = a.scheduledStart
      } else {
        mapC.set(a.patientId, { count: 1, last: a.scheduledStart })
      }
    })
    return Array.from(mapC.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([pid, info]) => ({
        patient: patientMap.get(pid),
        count: info.count,
        last: info.last,
      }))
  }, [appointments, patientMap])

  const printPdf = () => {
    if (!ref.current) return
    html2pdf().from(ref.current).save('reporte.pdf')
  }

  return (
    <Wrapper ref={ref}>
      <KpiGrid>
        <KpiCard>
          <span className="text-sm text-muted-foreground">Pacientes</span>
          <span className="text-lg font-semibold">{kpis.totalPatients}</span>
        </KpiCard>
        <KpiCard>
          <span className="text-sm text-muted-foreground">Citas</span>
          <span className="text-lg font-semibold">{kpis.totalAppointments}</span>
        </KpiCard>
        <KpiCard>
          <span className="text-sm text-muted-foreground">Registros médicos</span>
          <span className="text-lg font-semibold">{kpis.totalRecords}</span>
        </KpiCard>
        <KpiCard>
          <span className="text-sm text-muted-foreground">Promedio diario</span>
          <span className="text-lg font-semibold">{kpis.avgPerDay.toFixed(1)}</span>
        </KpiCard>
      </KpiGrid>

      <div className="flex justify-between items-center mt-4">
        <h2 className="font-medium">Citas completadas</h2>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((v) => (
            <button
              key={v}
              className={`px-2 py-1 rounded text-sm ${view === v ? 'bg-primary text-white' : 'bg-muted'}`}
              onClick={() => setView(v as 'day' | 'week' | 'month')}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      <Bar
        data={{
          labels: trends.labels,
          datasets: [{ label: 'Citas', data: trends.data, backgroundColor: '#3abdd4' }],
        }}
        options={{ plugins: { legend: { display: false } } }}
      />

      <div className="mt-8">
        <h2 className="font-medium mb-2">Promedio por día de la semana</h2>
        <Bar
          data={{
            labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
            datasets: [
              {
                label: 'Promedio',
                data: weekdayAvg,
                backgroundColor: '#1e3a8a',
              },
            ],
          }}
          options={{ indexAxis: 'y', plugins: { legend: { display: false } } }}
        />
      </div>

      <div className="mt-8 overflow-x-auto">
        <h2 className="font-medium mb-2">Pacientes frecuentes</h2>
        <table className="min-w-[400px] w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Citas</th>
              <th className="p-2 text-left">Última visita</th>
            </tr>
          </thead>
          <tbody>
            {topPatients.map((p) => (
              <tr key={p.patient?.patientId} className="border-b">
                <td className="p-2">
                  {p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : p.patient?.patientId}
                </td>
                <td className="p-2">{p.count}</td>
                <td className="p-2">{format(new Date(p.last), 'dd/MM/yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button className="mt-6" onClick={printPdf}>Imprimir PDF</Button>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-6`
const KpiGrid = tw.div`grid grid-cols-2 md:grid-cols-4 gap-4`
const KpiCard = tw.div`border rounded p-4 bg-muted flex flex-col`
