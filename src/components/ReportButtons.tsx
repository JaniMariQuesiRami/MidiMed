import { useState, useEffect, useRef } from 'react'
import { Download, Eye, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppointmentReport, type ReportData } from '@/hooks/useAppointmentReport'
import type { Appointment } from '@/types/db'

interface ReportButtonsProps {
  appointment: Appointment
  isGeneratingReport?: boolean
}

export function ReportButtons({ appointment, isGeneratingReport = false }: ReportButtonsProps) {
  const { getReportForAppointment } = useAppointmentReport()
  const [reportData, setReportData] = useState<ReportData>({ downloadUrl: null, status: 'loading' })
  const [isWaitingForReport, setIsWaitingForReport] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [retryCount, setRetryCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initial load
  useEffect(() => {
    if (appointment.status === 'completed') {
      getReportForAppointment(appointment).then(setReportData)
    } else {
      setReportData({ downloadUrl: null, status: 'unavailable' })
    }
  }, [appointment, getReportForAppointment])

  // Handle report generation waiting
  useEffect(() => {
    if (isGeneratingReport && appointment.status === 'completed') {
      setIsWaitingForReport(true)
      setRetryCount(0)
      
      // Start checking every 10 seconds immediately (no initial 20s wait)
      const startPolling = () => {
        let currentAttempt = 0
        
        intervalRef.current = setInterval(async () => {
          currentAttempt++
          setRetryCount(currentAttempt)
          
          try {
            // Check for report with fresh data
            const result = await getReportForAppointment(appointment, true)
            setReportData(result)
            
            // If report is available, stop immediately
            if (result.status === 'available') {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              setIsWaitingForReport(false)
              setRetryCount(0)
              return // Exit immediately
            }
            
            // If we've tried 12 times (2 minutes), stop
            if (currentAttempt >= 12) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              setIsWaitingForReport(false)
              setRetryCount(0)
            }
          } catch (error) {
            console.error('Error checking for report:', error)
          }
        }, 10000) // Check every 10 seconds
      }

      // Wait 20 seconds before starting to poll
      setTimeout(startPolling, 20000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      if (!isGeneratingReport) {
        setIsWaitingForReport(false)
        setRetryCount(0)
      }
    }
  }, [isGeneratingReport, appointment, getReportForAppointment])

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

  if (isGeneratingReport || isWaitingForReport) {
    return (
      <div className="flex items-center gap-1">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs text-muted-foreground">
          {!isWaitingForReport 
            ? 'Generando...' 
            : `Generando...`}
        </span>
      </div>
    )
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
