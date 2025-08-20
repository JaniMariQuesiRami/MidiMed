import { useState, useEffect } from 'react'
import { Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppointmentReport, type ReportData } from '@/hooks/useAppointmentReport'
import type { Appointment } from '@/types/db'

interface ReportButtonsProps {
  appointment: Appointment
}

export function ReportButtons({ appointment }: ReportButtonsProps) {
  const { getReportForAppointment } = useAppointmentReport()
  const [reportData, setReportData] = useState<ReportData>({ downloadUrl: null, status: 'loading' })

  useEffect(() => {
    if (appointment.status === 'completed') {
      getReportForAppointment(appointment).then(setReportData)
    } else {
      setReportData({ downloadUrl: null, status: 'unavailable' })
    }
  }, [appointment, getReportForAppointment])

  const handleView = () => {
    if (reportData.downloadUrl) {
      window.open(reportData.downloadUrl, '_blank')
    }
  }

  const handleDownload = () => {
    if (reportData.downloadUrl) {
      const link = document.createElement('a')
      link.href = reportData.downloadUrl
      link.download = `reporte-${appointment.appointmentId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (appointment.status !== 'completed') {
    return <span className="text-muted-foreground">—</span>
  }

  if (reportData.status === 'loading') {
    return (
      <div className="flex items-center gap-1">
        <Loader2 size={14} className="animate-spin" />
      </div>
    )
  }

  if (reportData.status === 'unavailable') {
    return <span className="text-muted-foreground">—</span>
  }

  if (reportData.status === 'error') {
    return (
      <span className="text-red-500 cursor-help" title="Reporte no disponible">
        Error
      </span>
    )
  }

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleView}
        className="h-7 px-2"
        title="Ver reporte PDF"
        aria-label="Ver reporte PDF"
      >
        <Eye size={14} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="h-7 px-2"
        title="Descargar reporte PDF"
        aria-label="Descargar reporte PDF"
      >
        <Download size={14} />
      </Button>
    </div>
  )
}
