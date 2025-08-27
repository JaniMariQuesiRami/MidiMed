'use client'
import { X, ArrowRight, ArrowLeft, ExternalLink, User, Calendar, Eye, CheckSquare, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'
import type { OnboardingStep } from '@/hooks/useOnboarding'

// Función para obtener el ícono apropiado para cada paso
const getStepIcon = (stepKey: string) => {
  switch (stepKey) {
    case 'createPatient':
      return <User size={18} className="text-blue-600" />
    case 'createAppointment':
      return <Calendar size={18} className="text-green-600" />
    case 'viewAppointmentInfo':
      return <Eye size={18} className="text-orange-600" />
    case 'completeAppointment':
      return <CheckSquare size={18} className="text-emerald-600" />
    case 'visitSettings':
      return <Settings size={18} className="text-purple-600" />
    default:
      return <User size={18} className="text-gray-600" />
  }
}

interface OnboardingTutorialProps {
  isActive: boolean
  currentStep: OnboardingStep
  stepNumber: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
  onNavigateToStep: (href: string, requiresModal?: 'createPatient' | 'createAppointment' | null) => void
  canGoPrev: boolean
  isLastStep: boolean
  isStepCompleted: boolean
}

export default function OnboardingTutorial({
  isActive,
  currentStep,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  onNavigateToStep,
  canGoPrev,
  isLastStep,
  isStepCompleted
}: OnboardingTutorialProps) {
  if (!isActive) return null

  const handleNavigate = () => {
    // Cerrar el tutorial primero
    onClose()
    
    // Luego navegar y manejar modales
    onNavigateToStep(currentStep.href, currentStep.requiresModal)
  }

  return (
    <>
      {/* Light overlay */}
      <TutorialOverlay onClick={onClose} />
      
      {/* Tutorial popover */}
      <TutorialPopover>
        <TutorialCard>
          <TutorialHeader>
            <TitleContainer>
              {getStepIcon(currentStep.key)}
              <TutorialTitle>{currentStep.title}</TutorialTitle>
            </TitleContainer>
            <CloseButton onClick={onClose} title="Cerrar guía">
              <X size={16} />
            </CloseButton>
          </TutorialHeader>
          
          <TutorialDescription>
            {currentStep.description}
          </TutorialDescription>
          
          <TutorialFooter>
            <TutorialProgress>
              <ProgressText>
                Paso {stepNumber} de {totalSteps}
              </ProgressText>
              <ProgressBar>
                <ProgressFill 
                  style={{ 
                    width: `${(stepNumber / totalSteps) * 100}%` 
                  }} 
                />
              </ProgressBar>
            </TutorialProgress>
            
            {/* Action button to navigate to the step */}
            <ActionButton>
              <Button
                onClick={handleNavigate}
                className="w-full flex items-center justify-center gap-2"
                disabled={isStepCompleted}
              >
                {isStepCompleted ? (
                  '✅ Completado'
                ) : (
                  <>
                    {currentStep.requiresModal ? '' : 'Ir a'} {currentStep.title}
                    <ExternalLink size={14} />
                  </>
                )}
              </Button>
            </ActionButton>
            
            <TutorialButtons>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                disabled={!canGoPrev}
                className="flex items-center gap-1"
              >
                <ArrowLeft size={14} />
                Anterior
              </Button>
              
              <Button
                size="sm"
                onClick={onNext}
                className="flex items-center gap-1"
              >
                {isLastStep ? (
                  'Finalizar'
                ) : (
                  <>
                    Siguiente
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </TutorialButtons>
          </TutorialFooter>
        </TutorialCard>
        
        {/* Arrow pointing down */}
        <TutorialArrow />
      </TutorialPopover>
    </>
  )
}

// Styled Components matching the Settings tutorial style
const TutorialOverlay = tw.div`
  fixed inset-0 bg-black/10 z-50
`

const TutorialPopover = tw.div`
  fixed top-20 left-1/2 transform -translate-x-1/2 z-50
  animate-in slide-in-from-top-2 duration-300
  max-w-sm w-full mx-4
`

const TutorialCard = tw.div`
  bg-background border rounded-lg shadow-xl p-5 relative
  ring-1 ring-border
`

const TutorialArrow = tw.div`
  absolute -bottom-2 left-1/2 transform -translate-x-1/2
  w-0 h-0 border-l-4 border-r-4 border-t-4
  border-l-transparent border-r-transparent border-t-border
  after:content-[''] after:absolute after:top-[-5px] after:left-[-3px]
  after:w-0 after:h-0 after:border-l-3 after:border-r-3 after:border-t-3
  after:border-l-transparent after:border-r-transparent after:border-t-background
`

const TutorialHeader = tw.div`
  flex justify-between items-start mb-3
`

const TitleContainer = tw.div`
  flex items-center gap-2 flex-1 pr-2
`

const TutorialTitle = tw.h3`
  text-lg font-semibold text-foreground leading-tight
`

const CloseButton = tw.button`
  p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors
  flex-shrink-0
`

const TutorialDescription = tw.p`
  text-sm text-muted-foreground leading-relaxed mb-4
`

const TutorialFooter = tw.div`
  space-y-4
`

const TutorialProgress = tw.div`
  space-y-2
`

const ProgressText = tw.p`
  text-xs text-muted-foreground text-center font-medium
`

const ProgressBar = tw.div`
  h-2 bg-muted rounded-full overflow-hidden
`

const ProgressFill = tw.div`
  h-full bg-primary rounded-full transition-all duration-500 ease-out
`

const ActionButton = tw.div`
  w-full
`

const TutorialButtons = tw.div`
  flex justify-between gap-3
`
