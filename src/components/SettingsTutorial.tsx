'use client'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'
import type { TutorialStep } from '@/hooks/useSettingsTutorial'

interface SettingsTutorialProps {
  isActive: boolean
  currentStep: TutorialStep
  stepNumber: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
  canGoPrev: boolean
  isLastStep: boolean
}

export default function SettingsTutorial({
  isActive,
  currentStep,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  canGoPrev,
  isLastStep
}: SettingsTutorialProps) {
  if (!isActive) return null

  return (
    <>
      {/* Light overlay - no blur */}
      <TutorialOverlay onClick={onClose} />
      
      {/* Popover positioned near the active tab */}
      <TutorialPopover>
        <TutorialCard>
          <TutorialHeader>
            <TutorialTitle>{currentStep.title}</TutorialTitle>
            <CloseButton onClick={onClose}>
              <X size={16} />
            </CloseButton>
          </TutorialHeader>
          
          <TutorialDescription>
            {currentStep.description}
          </TutorialDescription>
          
          <TutorialFooter>
            <TutorialProgress>
              <ProgressText>
                {stepNumber} de {totalSteps}
              </ProgressText>
              <ProgressBar>
                <ProgressFill 
                  style={{ 
                    width: `${(stepNumber / totalSteps) * 100}%` 
                  }} 
                />
              </ProgressBar>
            </TutorialProgress>
            
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
                  '¡Entendido! ✓'
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
        
        {/* Arrow pointing to the tab */}
        <TutorialArrow />
      </TutorialPopover>
    </>
  )
}

// Tutorial Styled Components
const TutorialOverlay = tw.div`
  fixed inset-0 bg-black/10 flex items-center justify-center z-40
`

const TutorialPopover = tw.div`
  fixed top-20 left-1/2 transform -translate-x-1/2 z-50
  animate-in slide-in-from-top-2 duration-300
`

const TutorialCard = tw.div`
  bg-background border rounded-lg shadow-lg max-w-xs w-full p-4 relative
  ring-1 ring-border
`

const TutorialHeader = tw.div`
  flex justify-between items-start mb-3
`

const TutorialTitle = tw.h3`
  text-sm font-semibold text-foreground pr-2
`

const CloseButton = tw.button`
  p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors
  flex-shrink-0
`

const TutorialDescription = tw.p`
  text-xs text-muted-foreground leading-relaxed mb-4
`

const TutorialFooter = tw.div`
  space-y-3
`

const TutorialProgress = tw.div`
  space-y-1
`

const ProgressBar = tw.div`
  h-1 bg-muted rounded-full
`

const ProgressFill = tw.div`
  h-full bg-primary rounded-full transition-all duration-300
`

const ProgressText = tw.p`
  text-xs text-muted-foreground text-center
`

const TutorialButtons = tw.div`
  flex justify-between gap-2
`

const TutorialArrow = tw.div`
  absolute -bottom-2 left-1/2 transform -translate-x-1/2
  w-0 h-0 border-l-4 border-r-4 border-t-4
  border-l-transparent border-r-transparent border-t-border
  after:content-[''] after:absolute after:top-[-5px] after:left-[-3px]
  after:w-0 after:h-0 after:border-l-3 after:border-r-3 after:border-t-3
  after:border-l-transparent after:border-r-transparent after:border-t-background
`
