"use client"
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { getAllReportData, calculateKPIs } from '@/db/reports'
import type { Appointment, Patient, MedicalRecord } from '@/types/db'
import { format, startOfWeek, addDays, startOfYear, addMonths, subMonths } from 'date-fns'
import tw from 'tailwind-styled-components'
import { Bar } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

interface Html2PdfOptions {
  margin?: number
  filename?: string
  image?: { type: string; quality: number }
  html2canvas?: {
    scale: number
    useCORS: boolean
    allowTaint: boolean
    backgroundColor?: string
    ignoreElements?: (element: Element) => boolean
    onclone?: (clonedDoc: Document) => void
  }
  jsPDF?: { unit: string; format: string; orientation: string }
}

interface Html2PdfInstance {
  set: (options: Html2PdfOptions) => Html2PdfInstance
  from: (element: HTMLElement) => Html2PdfInstance
  save: () => Promise<void>
}

interface Html2PdfModule {
  default: () => Html2PdfInstance
}

export default function ReportsDashboard() {
  const { tenant, user } = useContext(UserContext)
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([])
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tenant) return
    const load = async () => {
      const reportData = await getAllReportData(tenant.tenantId)
      setCompletedAppointments(reportData.completedAppointments)
      setAllAppointments(reportData.allAppointments)
      setPatients(reportData.patients)
      setMedicalRecords(reportData.medicalRecords)
    }
    load().catch(console.error)
  }, [tenant])

  const patientMap = useMemo(
    () => new Map(patients.map((p) => [p.patientId, p])),
    [patients],
  )

  const kpis = useMemo(() => {
    return calculateKPIs(completedAppointments, allAppointments, patients, medicalRecords)
  }, [completedAppointments, allAppointments, patients, medicalRecords])

  const trends = useMemo(() => {
    if (allAppointments.length === 0) return { labels: [], data: [] }
    const map = new Map<string, number>()
    if (view === 'day') {
      const start = startOfWeek(new Date(), { weekStartsOn: 1 })
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i)
        map.set(format(d, 'EEE'), 0)
      }
      allAppointments.forEach((a: Appointment) => {
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
      allAppointments.forEach((a: Appointment) => {
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
      allAppointments.forEach((a: Appointment) => {
        const d = new Date(a.scheduledStart)
        const label = format(d, 'MMM')
        if (map.has(label)) map.set(label, (map.get(label) || 0) + 1)
      })
    }
    return { labels: Array.from(map.keys()), data: Array.from(map.values()) }
  }, [allAppointments, view])

  const weekdayStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0] // Dom, Lun, Mar, Mié, Jue, Vie, Sáb
    const totalAppointments = allAppointments.length
    
    allAppointments.forEach((a: Appointment) => {
      const d = new Date(a.scheduledStart)
      counts[d.getDay()]++
    })
    
    // Calcular porcentajes
    const percentages = counts.map((count) => 
      totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0
    )
    
    return { counts, percentages }
  }, [allAppointments])

  const topPatients = useMemo(() => {
    const mapC = new Map<string, { count: number; last: string }>()
    completedAppointments.forEach((a: Appointment) => {
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
        patientId: pid,
        count: info.count,
        last: info.last,
      }))
  }, [completedAppointments, patientMap])

  const printPdf = async () => {
    if (!ref.current || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true)

      const originalCanvases = Array.from(
        ref.current.querySelectorAll('canvas')
      ) as HTMLCanvasElement[];

      const snapshots = originalCanvases.map((c) => ({
        dataUrl: c.toDataURL('image/png'),
        width: c.width,
        height: c.height,
      }));

      // Crear una copia del contenido con encabezado personalizado
      const originalContent = ref.current.cloneNode(true) as HTMLElement

      Array.from(originalContent.querySelectorAll('canvas')).forEach(
        (clonedCanvas, i) => {
          const snap = snapshots[i];
          const img = document.createElement('img');
          img.src = snap.dataUrl;
          img.width = snap.width;
          img.height = snap.height;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          clonedCanvas.replaceWith(img);
        }
      );

      // Crear contenedor temporal para el PDF
      const pdfContainer = document.createElement('div')
      pdfContainer.style.fontFamily = '"Source Sans Pro", sans-serif'
      pdfContainer.style.backgroundColor = '#ffffff'
      pdfContainer.style.padding = '20px'

      // Crear encabezado
      const header = document.createElement('div')
      header.style.marginBottom = '30px'
      header.style.borderBottom = '2px solid #3abdd4'
      header.style.paddingBottom = '20px'

      // Logo y título
      const headerTop = document.createElement('div')
      headerTop.style.display = 'flex'
      headerTop.style.alignItems = 'center'
      headerTop.style.justifyContent = 'space-between'
      headerTop.style.marginBottom = '15px'

      const logoContainer = document.createElement('div')
      logoContainer.style.display = 'flex'
      logoContainer.style.alignItems = 'center'
      logoContainer.style.gap = '10px'

      const logo = document.createElement('img')
      logo.src = '/logoPrimary.svg'
      logo.style.height = '40px'
      logo.style.width = 'auto'
      logo.style.display = 'block'
      logo.style.marginRight = '10px'
      logoContainer.appendChild(logo)

      const title = document.createElement('h1')
      title.textContent = 'MidiMed'
      title.style.display = 'inline-block'
      title.style.lineHeight = '1'
      title.style.verticalAlign = 'middle'
      title.style.fontSize = '28px'
      title.style.fontWeight = 'bold'
      title.style.color = '#3abdd4'
      title.style.margin = '0'
      title.style.padding = '0'
      title.style.alignSelf = 'center'
      logoContainer.appendChild(title)

      const dateTime = document.createElement('div')
      const now = new Date()
      dateTime.textContent = `Generado: ${now.toLocaleDateString('es-ES')} ${now.toLocaleTimeString('es-ES')}`
      dateTime.style.fontSize = '12px'
      dateTime.style.color = '#666'

      headerTop.appendChild(logoContainer)
      headerTop.appendChild(dateTime)

      // Información del reporte
      const reportInfo = document.createElement('div')
      reportInfo.style.display = 'grid'
      reportInfo.style.gridTemplateColumns = '1fr 1fr'
      reportInfo.style.gap = '20px'
      reportInfo.style.fontSize = '14px'

      const leftInfo = document.createElement('div')
      leftInfo.innerHTML = `
        <strong>Reporte de Análisis</strong><br>
        <span style="color: #666;">Organización: ${tenant?.name || 'MidiMed'}</span>
      `

      const rightInfo = document.createElement('div')
      rightInfo.innerHTML = `
        <span style="color: #666;">Generado por: ${user?.displayName || 'Usuario'}</span><br>
        <span style="color: #666;">Período: Desde la primera cita registrada</span>
      `

      reportInfo.appendChild(leftInfo)
      reportInfo.appendChild(rightInfo)

      header.appendChild(headerTop)
      header.appendChild(reportInfo)

      // Agregar encabezado y contenido al contenedor
      pdfContainer.appendChild(header)
      pdfContainer.appendChild(originalContent)

      // Agregar al DOM temporalmente
      document.body.appendChild(pdfContainer)

      // Importar dinámicamente y con timeout
      const html2pdfModule = await Promise.race([
        import('html2pdf.js'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout al cargar html2pdf')), 10000)
        )
      ]) as Html2PdfModule

      const html2pdf = html2pdfModule.default

      // Configurar opciones para mejor rendimiento
      const options = {
        margin: 0.5,
        filename: `reporte-midimed-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.9 },
        html2canvas: {
          scale: 1.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          ignoreElements: (element: Element) => {
            return element.classList.contains('no-print')
          },
          onclone: (clonedDoc: Document) => {
            // Convertir colores oklch a hex en el documento clonado
            const style = clonedDoc.createElement('style')
            style.textContent = `
              * {
                color: #000000 !important;
                background-color: transparent !important;
                border-color: #e2e8f0 !important;
              }
              .bg-primary { background-color: #3abdd4 !important; color: #ffffff !important; }
              .text-primary { color: #3abdd4 !important; }
              .bg-muted { background-color: #f8fafc !important; }
              .text-muted-foreground { color: #64748b !important; }
              .border { border: 1px solid #e2e8f0 !important; }
              .border-b { border-bottom: 1px solid #e2e8f0 !important; }
              .text-white { color: #ffffff !important; }
              .rounded { border-radius: 0.375rem !important; }
              .font-semibold { font-weight: 600 !important; }
              .font-medium { font-weight: 500 !important; }
              .text-sm { font-size: 0.875rem !important; }
              .text-lg { font-size: 1.125rem !important; }
              
              /* Estilos específicos para tablas */
              table { 
                border-collapse: collapse !important; 
                width: 100% !important;
                margin: 10px 0 !important;
              }
              th { 
                background-color: #f8fafc !important; 
                color: #374151 !important; 
                font-weight: 600 !important;
                border: 1px solid #e2e8f0 !important;
                padding: 8px !important;
                text-align: left !important;
              }
              td { 
                color: #374151 !important; 
                border: 1px solid #e2e8f0 !important;
                padding: 8px !important;
              }
              tr { 
                border-bottom: 1px solid #e2e8f0 !important; 
              }
              
              /* Estilos para KPI cards */
              .space-y-4 > * + * { margin-top: 1rem !important; }
              .grid { display: grid !important; }
              .gap-3 { gap: 0.75rem !important; }
              .grid-cols-2 { grid-template-columns: repeat(2, 1fr) !important; }
              .grid-cols-4 { grid-template-columns: repeat(4, 1fr) !important; }
              .p-3 { padding: 0.75rem !important; }
              .flex { display: flex !important; }
              .flex-col { flex-direction: column !important; }
              
              /* Asegurar que el texto sea visible */
              h1, h2, h3, h4, h5, h6 { color: #111827 !important; }
              p, span, div { color: #374151 !important; }
            `
            clonedDoc.head.appendChild(style)
          }
        },
        jsPDF: {
          unit: 'in',
          format: 'a4',
          orientation: 'portrait'
        }
      }

      await html2pdf().set(options).from(pdfContainer).save()

      // Limpiar el DOM
      document.body.removeChild(pdfContainer)

    } catch (error) {
      console.error('Error al generar PDF:', error)
      toast.error('Error al generar el PDF. Por favor, intenta nuevamente.')

      // Limpiar en caso de error
      const tempContainer = document.querySelector('div[style*="font-family: Source Sans Pro"]')
      if (tempContainer) {
        document.body.removeChild(tempContainer)
      }
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          /* Convertir colores oklch a hex/rgb para compatibilidad con PDF */
          .bg-primary {
            background-color: #3abdd4 !important;
          }
          .text-primary {
            color: #3abdd4 !important;
          }
          .bg-muted {
            background-color: #f8fafc !important;
          }
          .text-muted-foreground {
            color: #64748b !important;
          }
          .border {
            border-color: #e2e8f0 !important;
          }
          .border-b {
            border-bottom-color: #e2e8f0 !important;
          }
        }
        /* También aplicar para la generación de PDF */
        .pdf-safe {
          --primary: #3abdd4;
          --muted: #f8fafc;
          --muted-foreground: #64748b;
          --border: #e2e8f0;
        }
      `}</style>
      <Wrapper ref={ref} className="print-area pdf-safe">
        <KpiGrid>
          <KpiCard>
            <span className="text-sm text-muted-foreground">Total Pacientes</span>
            <span className="text-lg font-semibold">{kpis.totalPatients}</span>
          </KpiCard>
          <KpiCard>
            <span className="text-sm text-muted-foreground">Total Citas</span>
            <span className="text-lg font-semibold">{kpis.totalAppointments}</span>
          </KpiCard>
          <KpiCard>
            <span className="text-sm text-muted-foreground">Total Registros médicos</span>
            <span className="text-lg font-semibold">{kpis.totalRecords}</span>
          </KpiCard>
          <KpiCard>
            <span className="text-sm text-muted-foreground">Promedio semanal de citas</span>
            <span className="text-lg font-semibold">{kpis.avgPerWeek.toFixed(1)}</span>
          </KpiCard>
        </KpiGrid>

        <div className="flex justify-between items-center mt-3">
          <h2 className="font-medium">Cantidad de citas</h2>
          <div className="flex gap-2 no-print">
            {[
              { key: 'day', label: 'Día' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mes' }
            ].map((period) => (
              <button
                key={period.key}
                className={`px-2 py-1 rounded text-sm ${view === period.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
                onClick={() => setView(period.key as 'day' | 'week' | 'month')}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <Bar
            data={{
              labels: trends.labels,
              datasets: [{ label: 'Citas', data: trends.data, backgroundColor: '#3abdd4' }],
            }}
            options={{
              plugins: { legend: { display: false } },
              maintainAspectRatio: false,
            }}
          />
        </div>

        <div className="mt-6">
          <h2 className="font-medium mb-2">Distribución por día de la semana</h2>
          <div className="h-48">
            <Bar
              data={{
                labels: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
                datasets: [
                  {
                    label: 'Porcentaje (%)',
                    data: weekdayStats.percentages,
                    backgroundColor: '#3abdd4',
                  },
                ],
              }}
              options={{
                indexAxis: 'y',
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const dayIndex = context.dataIndex
                        const count = weekdayStats.counts[dayIndex]
                        const percentage = context.parsed.x
                        return `${count} citas (${percentage}%)`
                      }
                    }
                  }
                },
                maintainAspectRatio: false,
                scales: {
                  x: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <h2 className="font-medium mb-2">Pacientes frecuentes</h2>
          <table className="min-w-[400px] w-full text-sm">
            <thead>
              <tr className="bg-muted dark:bg-background">
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Citas</th>
                <th className="p-2 text-left">Última visita</th>
              </tr>
            </thead>
            <tbody>
              {topPatients.map((p) => (
                <tr key={p.patientId} className="border-b">
                  <td className="p-2">
                    {p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : 'Paciente no encontrado'}
                  </td>
                  <td className="p-2">{p.count}</td>
                  <td className="p-2">{format(new Date(p.last), 'dd/MM/yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-4 mb-4 no-print">
          <Button
            onClick={printPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </div>
      </Wrapper>
    </>
  )
}

const Wrapper = tw.div`space-y-4 max-h-full overflow-auto`
const KpiGrid = tw.div`grid grid-cols-2 md:grid-cols-4 gap-3`
const KpiCard = tw.div`border rounded p-3 bg-white dark:bg-background flex flex-col`
