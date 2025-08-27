'use client'

import tw from 'tailwind-styled-components'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useContext, useRef } from 'react'
import { BookOpen, CheckCircle, User, Calendar, Eye, CheckSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnboarding } from '@/hooks/useOnboarding'
import { UserContext } from '@/contexts/UserContext'
import OnboardingTutorial from '@/components/OnboardingTutorial'
import Lottie from 'react-lottie-player'

// Función para obtener el ícono apropiado para cada paso
const getStepIcon = (stepKey: string, isCompleted: boolean) => {
  const iconProps = { size: 14, className: isCompleted ? "text-green-600" : "text-primary" }
  
  switch (stepKey) {
    case 'createPatient':
      return <User {...iconProps} />
    case 'createAppointment':
      return <Calendar {...iconProps} />
    case 'viewAppointmentInfo':
      return <Eye {...iconProps} />
    case 'completeAppointment':
      return <CheckSquare {...iconProps} />
    case 'visitSettings':
      return <Settings {...iconProps} />
    default:
      return <User {...iconProps} />
  }
}

export default function OnboardingCard() {
  const { tenant } = useContext(UserContext)
  const {
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
  } = useOnboarding()
  
  const [showConfetti, setShowConfetti] = useState(false)
  const [hideCard, setHideCard] = useState(false)
  const [confettiData, setConfettiData] = useState<object | null>(null)
  const [wasCompleteOnLoad, setWasCompleteOnLoad] = useState<boolean | null>(null)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const previousProgressRef = useRef<typeof progress>(null)
  const router = useRouter()

  // Cargar la animación de confetti
  useEffect(() => {
    fetch('/lotties/Confetti.json')
      .then(response => response.json())
      .then(data => setConfettiData(data))
      .catch(error => console.error('Error loading confetti animation:', error))
  }, [])

  // Detectar si el onboarding ya estaba completo al cargar
  useEffect(() => {
    if (progress && wasCompleteOnLoad === null) {
      const onboardingComplete = isOnboardingComplete()
      setWasCompleteOnLoad(onboardingComplete)
      // Si ya estaba completo al cargar, marcar como completado inmediatamente
      if (onboardingComplete) {
        setOnboardingCompleted(true)
      }
    }
  }, [progress, wasCompleteOnLoad, isOnboardingComplete])

  // Detectar cuando se complete el onboarding EN VIVO y mostrar confetti
  useEffect(() => {
    // Solo ejecutar si ya hemos determinado el estado inicial
    if (wasCompleteOnLoad === null || !progress) return
    
    const currentComplete = isOnboardingComplete()
    const previousComplete = previousProgressRef.current ? 
      onboardingSteps.every(step => previousProgressRef.current?.[step.key as keyof typeof previousProgressRef.current] === true) 
      : false
    
    // Solo mostrar confetti si:
    // 1. El onboarding está completo ahora
    // 2. NO estaba completo antes (cambió durante esta sesión)
    // 3. NO estaba completo cuando se cargó la página inicialmente
    // 4. No se está mostrando confetti ya
    if (currentComplete && !previousComplete && !wasCompleteOnLoad && !showConfetti) {
      setShowConfetti(true)
    }
    
    // Actualizar la referencia del progreso anterior
    previousProgressRef.current = progress
  }, [progress, showConfetti, wasCompleteOnLoad, isOnboardingComplete, onboardingSteps])

  // Iniciar timer para ocultar la tarjeta cuando se active el confetti
  useEffect(() => {
    if (showConfetti) {
      const hideTimer = setTimeout(() => {
        setOnboardingCompleted(true) // Marcar como completado después de 5 segundos
        setHideCard(true)
      }, 5000)

      return () => {
        clearTimeout(hideTimer)
      }
    }
  }, [showConfetti])

  // Si la tarjeta debe ocultarse, no renderizar nada
  if (hideCard) {
    return null
  }

  // Si el tenant aún no ha cargado, no renderizar nada (evita el flash)
  if (!tenant) {
    return null
  }

  // Si el progress aún no ha cargado, no renderizar nada (evita el flash)
  if (!progress) {
    return null
  }

  // Si todos los pasos están completados Y el onboarding está marcado como completado, no renderizar
  const allStepsCompleted = onboardingSteps.every(step => 
    progress[step.key as keyof typeof progress] === true
  )
  
  if (onboardingCompleted && allStepsCompleted) {
    return null
  }

  const completedSteps = getCompletedSteps()
  const totalSteps = getTotalSteps()
  const progressPercentage = getProgress()

  const handleNavigateToStep = (href: string, requiresModal?: 'createPatient' | 'createAppointment' | null, stepKey?: string) => {
    // Caso especial para ver detalles de cita
    if (stepKey === 'viewAppointmentInfo') {
      // Navegar al dashboard con un parámetro especial
      const separator = href.includes('?') ? '&' : '?'
      const targetUrl = `${href}${separator}action=viewFirstAppointment`
      router.push(targetUrl)
      closeOnboarding()
      return
    }

    if (stepKey === 'completeAppointment') {
      // Navegar al dashboard con un parámetro especial para completar appointment
      const separator = href.includes('?') ? '&' : '?'
      const targetUrl = `${href}${separator}action=completeFirstAppointment`
      router.push(targetUrl)
      closeOnboarding()
      return
    }

    // Construir la URL con el parámetro del modal si es necesario
    let targetUrl = href
    if (requiresModal) {
      const separator = href.includes('?') ? '&' : '?'
      targetUrl = `${href}${separator}modal=${requiresModal}`
    }
    
    // Navegar a la página con o sin parámetro de modal
    router.push(targetUrl)
    
    // Cerrar el tutorial
    closeOnboarding()
  }

  return (
    <>
      <div className="relative">
        {/* Confetti Animation */}
        {showConfetti && confettiData && (
          <div className="absolute inset-0 pointer-events-none z-50 rounded-lg overflow-hidden">
            <Lottie
              loop={true}
              animationData={confettiData}
              play={true}
              style={{ 
                width: '100%', 
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          </div>
        )}
        
        <Card>
          <CardHeader>
          <HeaderContent>
            <TitleSection>
              <BookOpen size={20} className="text-primary" />
              <CardTitle>Guía de Inicio</CardTitle>
            </TitleSection>
            <Button
              variant="outline"
              size="sm"
              onClick={startOnboarding}
              className="text-xs"
              disabled={onboardingActive}
            >
              Abrir
            </Button>
          </HeaderContent>
        </CardHeader>

        <CardContent>
          <ProgressSection>
            <ProgressText>
              {completedSteps} de {totalSteps} pasos completados ({progressPercentage}%)
            </ProgressText>
            <ProgressBar>
              <Progress style={{ width: `${progressPercentage}%` }} />
            </ProgressBar>
          </ProgressSection>

          <StepsList>
            {onboardingSteps.map((step, idx) => {
              const completed = isStepCompleted(step.key)
              return (
                <StepItem key={step.key}>
                  <StepButton
                    onClick={() => {
                      // Si ya está completado, solo navegar al paso en el tutorial
                      if (completed) {
                        goToStep(idx)
                      } else {
                        // Si no está completado, ejecutar la acción directamente
                        handleNavigateToStep(step.href, step.requiresModal, step.key)
                      }
                    }}
                    $completed={completed}
                  >
                    <StepIcon>
                      {completed ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        getStepIcon(step.key, false)
                      )}
                    </StepIcon>
                    <StepContent>
                      <StepNumber>{idx + 1}.</StepNumber>
                      <StepLabel $completed={completed}>
                        {step.title}
                      </StepLabel>
                    </StepContent>
                  </StepButton>
                </StepItem>
              )
            })}
          </StepsList>
        </CardContent>
        </Card>
      </div>

      {/* Tutorial Modal */}
      <OnboardingTutorial
        isActive={onboardingActive}
        currentStep={currentStep}
        stepNumber={currentStepIndex + 1}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={closeOnboarding}
        onNavigateToStep={handleNavigateToStep}
        canGoPrev={currentStepIndex > 0}
        isLastStep={currentStepIndex === totalSteps - 1}
        isStepCompleted={isStepCompleted(currentStep?.key)}
      />
    </>
  )
}

// Styled Components
const Card = tw.div`
  bg-gradient-to-br from-blue-50 to-indigo-50 
  dark:from-blue-950/20 dark:to-indigo-950/20 
  border border-blue-200 dark:border-blue-800
  rounded-lg p-4 shadow-sm
`

const CardHeader = tw.div`
  mb-4
`

const HeaderContent = tw.div`
  flex items-center justify-between
`

const TitleSection = tw.div`
  flex items-center gap-2
`

const CardTitle = tw.h3`
  text-sm font-semibold text-foreground
`

const CardContent = tw.div`
  space-y-4
`

const ProgressSection = tw.div`
  space-y-2
`

const ProgressText = tw.p`
  text-xs text-muted-foreground font-medium
`

const ProgressBar = tw.div`
  w-full h-2 bg-muted rounded-full overflow-hidden
`

const Progress = tw.div`
  h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out
`

const StepsList = tw.div`
  space-y-2
`

const StepItem = tw.div`
  w-full
`

const StepButton = tw.button<{ $completed: boolean }>`
  flex items-center gap-3 w-full text-left p-2 rounded-md transition-all duration-200
  hover:bg-white/50 dark:hover:bg-white/5
  ${({ $completed }) => $completed ? 'opacity-60' : 'hover:shadow-sm'}
`

const StepIcon = tw.div`
  flex-shrink-0
`

const StepContent = tw.div`
  flex items-center gap-2 flex-1 min-w-0
`

const StepNumber = tw.span`
  text-xs font-medium text-muted-foreground flex-shrink-0
`

const StepLabel = tw.span<{ $completed: boolean }>`
  text-xs font-medium truncate
  ${({ $completed }) => $completed ? 'line-through text-muted-foreground' : 'text-foreground'}
`
