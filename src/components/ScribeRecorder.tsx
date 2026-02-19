/**
 * ScribeRecorder -- AI Medical Scribe recording UI component.
 * Manages the full scribe state machine (idle, recording, processing, completed, error)
 * and communicates extracted fields to the parent form.
 *
 * Changelog:
 * - 2026-02-19: Added PostHog analytics events (SCRIBE-007)
 * - 2026-02-19: Initial implementation (SCRIBE-004)
 */

'use client'

import { useState, useRef, useCallback, useContext } from 'react'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import {
  Mic,
  Square,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

import { auth } from '@/lib/firebase'
import { UserContext } from '@/contexts/UserContext'
import { trackEvent } from '@/utils/trackEvent'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { cn } from '@/lib/utils'

import type { ExtraFieldDef } from '@/types/db'
import type { ScribeFields } from '@/lib/ai/scribe-extraction'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ScribeState = 'idle' | 'recording' | 'processing' | 'completed' | 'error'

type ProcessingStep = 'transcribing' | 'extracting'

interface ScribeRecorderProps {
  customFields: ExtraFieldDef[]
  onFieldsExtracted: (fields: ScribeFields, transcript: string) => void
  onClear: () => void
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_DURATION_SECONDS = 3

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Formats seconds into MM:SS display string. */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ScribeRecorder({
  customFields,
  onFieldsExtracted,
  onClear,
  disabled = false,
}: ScribeRecorderProps) {
  // ---- Context ----
  const { user, tenant } = useContext(UserContext)

  // ---- State ----
  const [scribeState, setScribeState] = useState<ScribeState>('idle')
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('transcribing')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [transcriptVisible, setTranscriptVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Preserved audio blob for retry on network errors
  const audioBlobRef = useRef<Blob | null>(null)

  // Timer ref for processing step simulation
  const processingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Analytics: timestamp when processing starts (SCRIBE-007)
  const processingStartMsRef = useRef<number>(0)

  // Analytics: recording duration captured at stop (SCRIBE-007)
  const recordingDurationRef = useRef<number>(0)

  // ---- Audio recorder hook ----
  const {
    duration,
    isSupported,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder({
    onAutoStop: () => {
      toast.info('La grabacion se detuvo automaticamente al alcanzar el limite de 15 minutos.')
    },
    onWarning: () => {
      toast.warning('La grabacion se detenra en 30 segundos.')
    },
  })

  // ---- API submission ----

  const submitAudio = useCallback(
    async (audioBlob: Blob) => {
      setScribeState('processing')
      setProcessingStep('transcribing')
      setErrorMessage(null)
      processingStartMsRef.current = Date.now()

      // Simulate step progression: switch to "extracting" after 2 seconds
      processingTimerRef.current = setTimeout(() => {
        setProcessingStep('extracting')
      }, 2000)

      try {
        const token = await auth.currentUser?.getIdToken()
        if (!token) {
          throw new Error('NO_AUTH')
        }

        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        // Map ExtraFieldDef to the API's expected CustomFieldDef shape (without collection)
        const apiCustomFields = customFields.map((f) => ({
          key: f.key,
          label: f.label,
          type: f.type,
        }))
        formData.append('customFields', JSON.stringify(apiCustomFields))

        const response = await fetch('/api/ai/scribe', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        // Clear the processing step timer
        if (processingTimerRef.current) {
          clearTimeout(processingTimerRef.current)
          processingTimerRef.current = null
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: 'UNKNOWN' }))
          const errorCode = data.error as string

          // If extraction failed but we got a transcript, show it
          if (errorCode === 'EXTRACTION_FAILED' && data.transcript) {
            setTranscript(data.transcript)
            setErrorMessage(
              'No se pudieron extraer los datos clinicos. Puedes copiar la transcripcion manualmente.'
            )
            setScribeState('error')
            // SCRIBE-007: Track extraction failure
            if (tenant) {
              trackEvent('scribe_processing_failed', {
                tenantId: tenant.tenantId,
                errorType: errorCode,
                step: 'extraction',
              })
            }
            return
          }

          // Map error codes to user-friendly Spanish messages
          const errorMessages: Record<string, string> = {
            UNAUTHORIZED: 'No autorizado. Intenta cerrar sesion e iniciar de nuevo.',
            AUDIO_TOO_LARGE: 'El archivo de audio es demasiado grande (maximo 25 MB).',
            INVALID_AUDIO_FORMAT: 'Formato de audio no valido.',
            MISSING_AUDIO: 'No se recibio el archivo de audio.',
            TRANSCRIPTION_FAILED: 'Error al transcribir el audio. Intenta de nuevo.',
          }

          setErrorMessage(errorMessages[errorCode] || 'Ocurrio un error inesperado.')
          setScribeState('error')
          // SCRIBE-007: Track processing failure
          if (tenant) {
            trackEvent('scribe_processing_failed', {
              tenantId: tenant.tenantId,
              errorType: errorCode,
              step: errorCode === 'TRANSCRIPTION_FAILED' ? 'transcription' : 'extraction',
            })
          }
          return
        }

        const data = await response.json()
        const fields = data.fields as ScribeFields
        const responseTranscript = data.transcript as string

        setTranscript(responseTranscript)
        audioBlobRef.current = null // Clear blob on success
        setScribeState('completed')
        onFieldsExtracted(fields, responseTranscript)

        // SCRIBE-007: Track processing completed
        if (tenant) {
          const standardFieldNames = ['summary', 'diagnosis', 'prescribedMedications', 'followUpInstructions', 'notes'] as const
          const vitalNames = ['heightCm', 'weightKg', 'bloodPressure', 'temperatureC'] as const
          let fieldsFilledCount = 0
          standardFieldNames.forEach((f) => {
            if (fields[f] != null) fieldsFilledCount++
          })
          vitalNames.forEach((v) => {
            if (fields.vitals[v] != null) fieldsFilledCount++
          })
          const customFieldsFilledCount = fields.extras ? Object.keys(fields.extras).length : 0
          trackEvent('scribe_processing_completed', {
            tenantId: tenant.tenantId,
            processingTimeMs: Date.now() - processingStartMsRef.current,
            fieldsFilledCount: fieldsFilledCount + customFieldsFilledCount,
            customFieldsFilledCount,
          })
        }
      } catch (err: unknown) {
        // Clear the processing step timer
        if (processingTimerRef.current) {
          clearTimeout(processingTimerRef.current)
          processingTimerRef.current = null
        }

        if (err instanceof Error && err.message === 'NO_AUTH') {
          setErrorMessage('No se pudo obtener el token de autenticacion. Intenta cerrar sesion e iniciar de nuevo.')
        } else {
          // Network error -- preserve blob for retry
          setErrorMessage('Error de conexion. Verifica tu internet e intenta de nuevo.')
        }
        setScribeState('error')
      }
    },
    [customFields, onFieldsExtracted, tenant]
  )

  // ---- Event handlers ----

  const handleStartRecording = useCallback(async () => {
    setTranscript(null)
    setTranscriptVisible(false)
    setErrorMessage(null)
    audioBlobRef.current = null

    try {
      await startRecording()
      setScribeState('recording')
      // SCRIBE-007: Track recording started
      if (tenant && user) {
        trackEvent('scribe_recording_started', {
          tenantId: tenant.tenantId,
          userId: user.uid,
        })
      }
    } catch {
      toast.error('No se pudo iniciar la grabacion. Verifica los permisos del microfono.')
      setScribeState('idle')
    }
  }, [startRecording, tenant, user])

  const handleStopRecording = useCallback(async () => {
    if (duration < MIN_DURATION_SECONDS) {
      cancelRecording()
      toast.error('La grabacion es muy corta. Intenta de nuevo hablando por mas tiempo.')
      setScribeState('idle')
      return
    }

    // Capture duration before stopping (SCRIBE-007)
    recordingDurationRef.current = duration

    try {
      const blob = await stopRecording()
      audioBlobRef.current = blob

      // SCRIBE-007: Track recording stopped
      if (tenant && user) {
        trackEvent('scribe_recording_stopped', {
          tenantId: tenant.tenantId,
          userId: user.uid,
          durationSeconds: recordingDurationRef.current,
        })
      }

      await submitAudio(blob)
    } catch {
      toast.error('Error al detener la grabacion.')
      setScribeState('idle')
    }
  }, [duration, cancelRecording, stopRecording, submitAudio, tenant, user])

  const handleRetry = useCallback(async () => {
    const blob = audioBlobRef.current
    if (blob) {
      await submitAudio(blob)
    } else {
      // No blob preserved, start fresh
      setScribeState('idle')
    }
  }, [submitAudio])

  const handleReRecord = useCallback(() => {
    setConfirmDialogOpen(true)
  }, [])

  const handleConfirmReRecord = useCallback(async () => {
    setConfirmDialogOpen(false)
    onClear()
    setTranscript(null)
    setTranscriptVisible(false)
    audioBlobRef.current = null

    try {
      await startRecording()
      setScribeState('recording')
      // SCRIBE-007: Track recording started (re-record)
      if (tenant && user) {
        trackEvent('scribe_recording_started', {
          tenantId: tenant.tenantId,
          userId: user.uid,
        })
      }
    } catch {
      toast.error('No se pudo iniciar la grabacion. Verifica los permisos del microfono.')
      setScribeState('idle')
    }
  }, [onClear, startRecording, tenant, user])

  const handleClearFields = useCallback(() => {
    onClear()
    setTranscript(null)
    setTranscriptVisible(false)
    audioBlobRef.current = null
    setScribeState('idle')
  }, [onClear])

  const handleDismissError = useCallback(() => {
    setErrorMessage(null)
    setScribeState('idle')
  }, [])

  const handleToggleTranscript = useCallback(() => {
    setTranscriptVisible((prev) => {
      // SCRIBE-007: Track transcript viewed (only when expanding)
      if (!prev && tenant) {
        trackEvent('scribe_transcript_viewed', { tenantId: tenant.tenantId })
      }
      return !prev
    })
  }, [tenant])

  // ---- Render: handle recorder errors ----

  if (recorderError === 'PERMISSION_DENIED') {
    return (
      <Wrapper>
        <ErrorBox>
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            Permiso de microfono denegado. Habilita el acceso al microfono en la configuracion de tu navegador.
          </p>
        </ErrorBox>
      </Wrapper>
    )
  }

  if (recorderError === 'DEVICE_NOT_FOUND') {
    return (
      <Wrapper>
        <ErrorBox>
          <AlertCircle className="size-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            No se encontro un microfono. Conecta un microfono e intenta de nuevo.
          </p>
        </ErrorBox>
      </Wrapper>
    )
  }

  if (!isSupported) {
    return null
  }

  // ---- Render: state-based UI ----

  return (
    <Wrapper>
      {/* ---- Idle State ---- */}
      {scribeState === 'idle' && (
        <div className="space-y-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled}
            onClick={handleStartRecording}
          >
            <Sparkles className="size-4" />
            Dictar con IA
            <Mic className="size-4" />
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Dicta tus notas y la IA llenara el formulario
          </p>
        </div>
      )}

      {/* ---- Recording State ---- */}
      {scribeState === 'recording' && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            onClick={handleStopRecording}
          >
            <Square className="size-4" />
            Detener grabacion
          </Button>
          <RecordingIndicator>
            <PulsingDot />
            <span className="text-sm font-mono text-destructive">
              {formatDuration(duration)}
            </span>
            <span className="text-xs text-muted-foreground">Grabando...</span>
          </RecordingIndicator>
        </div>
      )}

      {/* ---- Processing State ---- */}
      {scribeState === 'processing' && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled
          >
            <Loader2 className="size-4 animate-spin" />
            Procesando...
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {processingStep === 'transcribing'
              ? 'Transcribiendo audio...'
              : 'Extrayendo datos clinicos...'}
          </p>
        </div>
      )}

      {/* ---- Completed State ---- */}
      {scribeState === 'completed' && (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleReRecord}
          >
            <Mic className="size-4" />
            Dictar de nuevo
          </Button>

          {/* Transcript section */}
          {transcript && (
            <div>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                )}
                onClick={handleToggleTranscript}
              >
                {transcriptVisible ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
                Ver transcripcion
              </button>
              {transcriptVisible && (
                <TranscriptBox>{transcript}</TranscriptBox>
              )}
            </div>
          )}

          {/* Clear AI fields button */}
          <button
            type="button"
            className="text-xs text-destructive hover:text-destructive/80 transition-colors cursor-pointer"
            onClick={handleClearFields}
          >
            Limpiar campos IA
          </button>
        </div>
      )}

      {/* ---- Error State ---- */}
      {scribeState === 'error' && (
        <div className="space-y-2">
          <ErrorBox>
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{errorMessage}</p>
          </ErrorBox>

          {/* Show transcript if available (extraction failed but transcription succeeded) */}
          {transcript && (
            <div>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                )}
                onClick={handleToggleTranscript}
              >
                {transcriptVisible ? (
                  <ChevronUp className="size-3" />
                ) : (
                  <ChevronDown className="size-3" />
                )}
                Ver transcripcion
              </button>
              {transcriptVisible && (
                <TranscriptBox>{transcript}</TranscriptBox>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {audioBlobRef.current && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRetry}
              >
                Reintentar
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDismissError}
            >
              Descartar
            </Button>
          </div>
        </div>
      )}

      {/* ---- Re-record Confirmation Dialog ---- */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Dictar de nuevo</DialogTitle>
            <DialogDescription>
              Esto reemplazara los campos llenados por IA. ¿Continuar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReRecord}
            >
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Wrapper>
  )
}

// ---------------------------------------------------------------------------
// Styled components (tw tagged templates)
// ---------------------------------------------------------------------------

const Wrapper = tw.div`
  w-full space-y-2 p-3 rounded-lg border border-border bg-muted/20
`

const RecordingIndicator = tw.div`
  flex items-center justify-center gap-2
`

const PulsingDot = tw.div`
  size-2.5 rounded-full bg-destructive animate-pulse
`

const ErrorBox = tw.div`
  flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20
`

const TranscriptBox = tw.div`
  mt-1 p-3 text-xs leading-relaxed text-foreground whitespace-pre-wrap
  bg-muted/30 rounded-md border border-border max-h-40 overflow-y-auto
`
