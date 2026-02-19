/**
 * useAudioRecorder -- Reusable React hook that abstracts the browser MediaRecorder API
 * for audio capture. Handles codec negotiation, timer, auto-stop, and full cleanup.
 *
 * Changelog:
 * - 2026-02-19: Initial implementation (SCRIBE-003)
 */

import { useState, useRef, useCallback, useEffect } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AudioRecorderError =
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED'
  | 'DEVICE_NOT_FOUND'
  | 'RECORDING_FAILED'

export interface UseAudioRecorderOptions {
  /** Maximum recording duration in seconds. Default 900 (15 min). */
  maxDurationSeconds?: number
  /** Called when recording is automatically stopped at max duration. */
  onAutoStop?: () => void
  /** Called 30 seconds before the max duration is reached. */
  onWarning?: () => void
}

export interface UseAudioRecorderReturn {
  isRecording: boolean
  /** Elapsed recording time in seconds. */
  duration: number
  /** Whether the browser supports MediaRecorder with a compatible MIME type. */
  isSupported: boolean
  error: AudioRecorderError | null
  startRecording: () => Promise<void>
  /** Stops the recording and returns the audio Blob. */
  stopRecording: () => Promise<Blob>
  /** Discards the current recording without returning data. */
  cancelRecording: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MAX_DURATION_SECONDS = 900 // 15 minutes
const WARNING_OFFSET_SECONDS = 30

/**
 * MIME types to try, in order of preference.
 * webm/opus is the most widely supported on desktop browsers.
 * mp4 is the fallback for iOS Safari which does not support webm.
 */
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines the first supported MIME type for MediaRecorder, or null if
 * none of the candidates are supported.
 */
function getSupportedMimeType(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  for (const mimeType of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }
  return null
}

/**
 * Maps a DOMException (or generic Error) from getUserMedia / MediaRecorder
 * to one of the typed AudioRecorderError values.
 */
function mapError(err: unknown): AudioRecorderError {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
        return 'PERMISSION_DENIED'
      case 'NotFoundError':
        return 'DEVICE_NOT_FOUND'
      default:
        return 'RECORDING_FAILED'
    }
  }
  return 'RECORDING_FAILED'
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAudioRecorder(
  options?: UseAudioRecorderOptions
): UseAudioRecorderReturn {
  const maxDuration = options?.maxDurationSeconds ?? DEFAULT_MAX_DURATION_SECONDS
  const onAutoStop = options?.onAutoStop
  const onWarning = options?.onWarning

  // ---- State ----
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<AudioRecorderError | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  // ---- Refs (mutable values that should not trigger re-renders) ----
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationRef = useRef(0)
  const mimeTypeRef = useRef<string | null>(null)
  const warningFiredRef = useRef(false)

  // Store the latest callback refs so the timer closure always sees fresh values
  const onAutoStopRef = useRef(onAutoStop)
  onAutoStopRef.current = onAutoStop
  const onWarningRef = useRef(onWarning)
  onWarningRef.current = onWarning

  // Ref to hold a pending stopRecording resolve so the ondataavailable/onstop
  // callback can settle the promise.
  const stopResolveRef = useRef<((blob: Blob) => void) | null>(null)
  const stopRejectRef = useRef<((err: Error) => void) | null>(null)

  // Track whether the component is still mounted to guard async callbacks
  const mountedRef = useRef(true)

  // ---- Browser support check on mount ----
  useEffect(() => {
    const mimeType = getSupportedMimeType()
    mimeTypeRef.current = mimeType
    setIsSupported(mimeType !== null)
  }, [])

  // ---- Internal helpers ----

  /**
   * Stops the 1-second interval timer and resets duration tracking.
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  /**
   * Releases all media tracks from the active MediaStream and
   * cleans up the MediaRecorder reference.
   */
  const releaseMediaResources = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
    mediaRecorderRef.current = null
  }, [])

  /**
   * Internal stop procedure shared between public stopRecording, cancelRecording,
   * and the auto-stop logic. Stops the MediaRecorder if it is active.
   */
  const stopMediaRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  /**
   * Fully resets hook state back to idle. Used after stop, cancel, or error.
   */
  const resetState = useCallback(() => {
    clearTimer()
    releaseMediaResources()
    chunksRef.current = []
    durationRef.current = 0
    warningFiredRef.current = false
    if (mountedRef.current) {
      setIsRecording(false)
      setDuration(0)
    }
  }, [clearTimer, releaseMediaResources])

  // ---- Public API ----

  const startRecording = useCallback(async () => {
    // Guard: already recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      return
    }

    const mimeType = mimeTypeRef.current
    if (!mimeType) {
      setError('NOT_SUPPORTED')
      return
    }

    // Clear previous error
    setError(null)
    chunksRef.current = []
    durationRef.current = 0
    warningFiredRef.current = false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        // Build the final blob from collected chunks
        const blob = new Blob(chunksRef.current, { type: mimeType })

        // Resolve the pending stopRecording promise, if one exists
        if (stopResolveRef.current) {
          stopResolveRef.current(blob)
          stopResolveRef.current = null
          stopRejectRef.current = null
        }
      }

      recorder.onerror = () => {
        if (mountedRef.current) {
          setError('RECORDING_FAILED')
        }
        if (stopRejectRef.current) {
          stopRejectRef.current(new Error('MediaRecorder error'))
          stopResolveRef.current = null
          stopRejectRef.current = null
        }
        resetState()
      }

      // Request data every second so chunks are available incrementally
      recorder.start(1000)

      if (mountedRef.current) {
        setIsRecording(true)
        setDuration(0)
      }

      // Start the 1-second tick timer
      timerRef.current = setInterval(() => {
        durationRef.current += 1
        const current = durationRef.current

        if (mountedRef.current) {
          setDuration(current)
        }

        // Warning callback at (maxDuration - 30)
        const warningThreshold = maxDuration - WARNING_OFFSET_SECONDS
        if (current >= warningThreshold && !warningFiredRef.current) {
          warningFiredRef.current = true
          onWarningRef.current?.()
        }

        // Auto-stop at maxDuration
        if (current >= maxDuration) {
          // We need to trigger a full stop cycle. We call stopMediaRecorder
          // directly; onstop will fire and resolve any pending promise.
          clearTimer()

          const currentRecorder = mediaRecorderRef.current
          if (currentRecorder && currentRecorder.state !== 'inactive') {
            // If there is no pending stop promise, we create one internally to handle
            // the blob. The auto-stop scenario doesn't have an external consumer
            // calling stopRecording(), so we handle cleanup ourselves.
            if (!stopResolveRef.current) {
              // Create a self-resolving promise for auto-stop
              stopResolveRef.current = () => {
                // Blob is produced but discarded in auto-stop (the parent component
                // can retrieve it via the onAutoStop callback if needed, but per spec
                // auto-stop simply invokes the callback).
              }
            }
            currentRecorder.stop()
          }

          // Release resources after a small delay to let onstop fire
          setTimeout(() => {
            releaseMediaResources()
            chunksRef.current = []
            durationRef.current = 0
            warningFiredRef.current = false
            if (mountedRef.current) {
              setIsRecording(false)
              setDuration(0)
            }
          }, 50)

          onAutoStopRef.current?.()
        }
      }, 1000)
    } catch (err: unknown) {
      const mappedError = mapError(err)
      if (mountedRef.current) {
        setError(mappedError)
      }
      releaseMediaResources()
    }
  }, [maxDuration, clearTimer, releaseMediaResources, resetState])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise<Blob>((resolve, reject) => {
      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        reject(new Error('No active recording'))
        return
      }

      // Store resolve/reject so the onstop handler can settle the promise
      stopResolveRef.current = resolve
      stopRejectRef.current = reject

      clearTimer()
      recorder.stop()

      // Release the media stream tracks (mic indicator turns off)
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
      mediaRecorderRef.current = null

      if (mountedRef.current) {
        setIsRecording(false)
      }
    })
  }, [clearTimer])

  const cancelRecording = useCallback(() => {
    stopMediaRecorder()
    resetState()
    // Reject any pending stop promise so it doesn't hang
    if (stopRejectRef.current) {
      stopRejectRef.current(new Error('Recording cancelled'))
      stopResolveRef.current = null
      stopRejectRef.current = null
    }
  }, [stopMediaRecorder, resetState])

  // ---- Cleanup on unmount ----
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Stop the timer
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      // Stop all media tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
        mediaStreamRef.current = null
      }
      // Stop the recorder if still active
      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      }
      mediaRecorderRef.current = null
    }
  }, [])

  return {
    isRecording,
    duration,
    isSupported,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}
