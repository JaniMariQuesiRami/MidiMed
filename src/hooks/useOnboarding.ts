'use client'
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import type { OnboardingProgress } from '@/types/db'
import { useHighlight } from './useHighlight'

export type OnboardingStep = {
  key: keyof OnboardingProgress
  title: string
  description: string
  href: string
  requiresModal?: 'createPatient' | 'createAppointment' | null
  highlightElement?: string
}

const onboardingSteps: OnboardingStep[] = [
  {
    key: 'createPatient',
    title: 'Crear tu Primer Paciente',
    description: 'Comienza agregando un paciente a tu sistema. Incluye información básica como nombre, teléfono, email y fecha de nacimiento. Los pacientes son la base de tu práctica médica.',
    href: '/patients',
    requiresModal: 'createPatient',
    highlightElement: 'create-patient-btn'
  },
  {
    key: 'createAppointment',
    title: 'Agendar Primera Cita',
    description: 'Programa una cita médica para tu paciente. Selecciona fecha, hora y tipo de consulta. El sistema te ayudará a gestionar tu agenda de manera eficiente.',
    href: '/dashboard',
    requiresModal: 'createAppointment',
    highlightElement: 'create-appointment-btn'
  },
  {
    key: 'viewAppointmentInfo',
    title: 'Ver Detalles de Cita',
    description: 'Aprende a revisar la información completa de una cita. Ve datos del paciente, historial médico y toda la información relevante para la consulta.',
    href: '/dashboard',
    highlightElement: 'calendar-container'
  },
  {
    key: 'completeAppointment',
    title: 'Completar una Consulta',
    description: 'Finaliza el proceso completando una cita médica. Agrega notas médicas, diagnósticos, tratamientos y marca la consulta como terminada.',
    href: '/dashboard',
    highlightElement: 'calendar-container'
  },
  {
    key: 'visitSettings',
    title: 'Visitar las Configuraciones',
    description: 'Explora las configuraciones de tu clínica. Personaliza información de tu organización, gestiona tu equipo, configura formularios y administra tu suscripción.',
    href: '/settings',
    highlightElement: 'settings-nav'
  }
]

export function useOnboarding() {
  const { tenant } = useContext(UserContext)
  const { highlight, removeHighlight } = useHighlight()
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [onboardingActive, setOnboardingActive] = useState(false)

  useEffect(() => {
    if (!tenant) return
    
    const unsub = onSnapshot(doc(db, 'tenants', tenant.tenantId), (snap) => {
      const data = snap.data() as { onboarding?: OnboardingProgress } | undefined
      const onboardingProgress = data?.onboarding ?? null
      setProgress(onboardingProgress)
      
      // Encuentra el primer paso no completado
      if (onboardingProgress) {
        const firstIncomplete = onboardingSteps.findIndex(step => !onboardingProgress[step.key])
        setCurrentStepIndex(firstIncomplete >= 0 ? firstIncomplete : 0)
      }
    })
    return () => unsub()
  }, [tenant])

  const startOnboarding = () => {
    setOnboardingActive(true)
    // Resaltar el elemento del primer paso si existe
    const firstStep = onboardingSteps[currentStepIndex]
    if (firstStep.highlightElement) {
      setTimeout(() => {
        highlight({
          elementId: firstStep.highlightElement!,
          pulse: true
        })
      }, 300)
    }
  }

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < onboardingSteps.length) {
      setCurrentStepIndex(nextIndex)
      // Resaltar el siguiente elemento
      const nextStep = onboardingSteps[nextIndex]
      if (nextStep.highlightElement) {
        removeHighlight()
        setTimeout(() => {
          highlight({
            elementId: nextStep.highlightElement!,
            pulse: true
          })
        }, 300)
      }
    } else {
      closeOnboarding()
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      setCurrentStepIndex(prevIndex)
      // Resaltar el elemento anterior
      const prevStep = onboardingSteps[prevIndex]
      if (prevStep.highlightElement) {
        removeHighlight()
        setTimeout(() => {
          highlight({
            elementId: prevStep.highlightElement!,
            pulse: true
          })
        }, 300)
      }
    }
  }

  const closeOnboarding = () => {
    setOnboardingActive(false)
    removeHighlight()
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < onboardingSteps.length) {
      setCurrentStepIndex(stepIndex)
      // Resaltar el elemento del paso seleccionado si el tutorial está activo
      if (onboardingActive) {
        const step = onboardingSteps[stepIndex]
        if (step.highlightElement) {
          removeHighlight()
          setTimeout(() => {
            highlight({
              elementId: step.highlightElement!,
              pulse: true
            })
          }, 300)
        }
      }
    }
  }

  const getCompletedSteps = () => {
    if (!progress) return 0
    return onboardingSteps.filter(step => progress[step.key]).length
  }

  const getTotalSteps = () => {
    return onboardingSteps.length
  }

  const getProgress = () => {
    const completed = getCompletedSteps()
    const total = getTotalSteps()
    return Math.round((completed / total) * 100)
  }

  const isStepCompleted = (stepKey: keyof OnboardingProgress) => {
    return progress ? progress[stepKey] : false
  }

  const isOnboardingComplete = () => {
    return getCompletedSteps() === getTotalSteps()
  }

  const currentStep = onboardingSteps[currentStepIndex]

  return {
    tenant,
    progress,
    onboardingSteps,
    currentStep,
    currentStepIndex,
    onboardingActive,
    startOnboarding,
    nextStep,
    prevStep,
    closeOnboarding,
    goToStep,
    getCompletedSteps,
    getTotalSteps,
    getProgress,
    isStepCompleted,
    isOnboardingComplete
  }
}
