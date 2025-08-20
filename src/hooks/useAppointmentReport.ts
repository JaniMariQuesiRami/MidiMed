import { useState, useCallback, useRef } from 'react'
import { getMedicalRecordById, getMedicalRecordByAppointmentId } from '@/db/patients'
import type { Appointment, MedicalRecord } from '@/types/db'

export type ReportStatus = 'loading' | 'available' | 'unavailable' | 'error'

export interface ReportData {
  downloadUrl: string | null
  status: ReportStatus
}

export function useAppointmentReport() {
  const [reportCache, setReportCache] = useState<Map<string, ReportData>>(new Map())
  const loadingPromises = useRef<Map<string, Promise<ReportData>>>(new Map())

  const getReportForAppointment = useCallback(async (appointment: Appointment, forceFresh = false): Promise<ReportData> => {
    const cacheKey = appointment.appointmentId
    
    // Check cache first (unless forceFresh is true)
    if (!forceFresh) {
      const cached = reportCache.get(cacheKey)
      if (cached && cached.status !== 'loading') {
        return cached
      }
    }

    // Check if already loading (unless forceFresh is true)
    if (!forceFresh) {
      const existingPromise = loadingPromises.current.get(cacheKey)
      if (existingPromise) {
        return existingPromise
      }
    }

    // If forceFresh, clear cache first
    if (forceFresh) {
      setReportCache(prev => {
        const newCache = new Map(prev)
        newCache.delete(cacheKey)
        return newCache
      })
      loadingPromises.current.delete(cacheKey)
    }

    // Start loading
    const loadingPromise = (async (): Promise<ReportData> => {
      // Set loading state
      const loadingState: ReportData = { downloadUrl: null, status: 'loading' }
      setReportCache(prev => new Map(prev).set(cacheKey, loadingState))

      try {
        let medicalRecord: MedicalRecord | null = null

        // Try to get medical record by medicalRecordId first
        if (appointment.medicalRecordId) {
          try {
            medicalRecord = await getMedicalRecordById(appointment.medicalRecordId)
          } catch (error) {
            console.warn(`Medical record ${appointment.medicalRecordId} not found, trying by appointmentId, error: ${error}`)
          }
        }

        // If no medical record found by ID, try by appointmentId
        if (!medicalRecord) {
          medicalRecord = await getMedicalRecordByAppointmentId(appointment.appointmentId)
        }

        // Check if summaryPdf exists and has downloadUrl
        const downloadUrl = medicalRecord?.summaryPdf?.downloadUrl || null
        const status: ReportStatus = downloadUrl ? 'available' : 'unavailable'
        
        const result: ReportData = { downloadUrl, status }
        setReportCache(prev => new Map(prev).set(cacheKey, result))
        
        return result
      } catch (error) {
        console.error('Error fetching report for appointment:', appointment.appointmentId, error)
        const errorResult: ReportData = { downloadUrl: null, status: 'error' }
        setReportCache(prev => new Map(prev).set(cacheKey, errorResult))
        return errorResult
      } finally {
        // Clean up loading promise
        loadingPromises.current.delete(cacheKey)
      }
    })()

    loadingPromises.current.set(cacheKey, loadingPromise)
    return loadingPromise
  }, [reportCache])

  const clearCache = useCallback(() => {
    setReportCache(new Map())
    loadingPromises.current.clear()
  }, [])

  return {
    getReportForAppointment,
    clearCache,
  }
}
