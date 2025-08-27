"use client"
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import OrganizationSettingsForm from '@/components/OrganizationSettingsForm'
import TeamSettings from '@/components/TeamSettings'
import ExtraFieldsSettings from '@/components/ExtraFieldsSettings'
import PlanManagement from '@/components/PlanManagement'
import LoadingSpinner from '@/components/LoadingSpinner'
import SettingsTutorial from '@/components/SettingsTutorial'
import { useSettingsTutorial } from '@/hooks/useSettingsTutorial'
import { HelpCircle } from 'lucide-react'
import tw from 'tailwind-styled-components'

function SettingsContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'org' | 'team' | 'forms' | 'plan'>('org')

  // Tutorial hook
  const {
    tutorialActive,
    tutorialStep,
    tutorialSteps,
    currentStep,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial
  } = useSettingsTutorial()

  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'org' | 'team' | 'forms' | 'plan'
    if (tabParam && ['org', 'team', 'forms', 'plan'].includes(tabParam)) {
      setTab(tabParam)
    }
  }, [searchParams])

  // Sync tutorial step with current tab
  useEffect(() => {
    if (tutorialActive && currentStep) {
      setTab(currentStep.tab)
    }
  }, [tutorialStep, tutorialActive, currentStep])

  return (
    <>
      <Wrapper>
        <TabsContainer>
          <Tabs>
            <Tab
              $active={tab === 'org'}
              onClick={() => !tutorialActive && setTab('org')}
              $tutorial={tutorialActive && currentStep?.tab === 'org'}
            >
              Organización
            </Tab>
            <Tab
              $active={tab === 'team'}
              onClick={() => !tutorialActive && setTab('team')}
              $tutorial={tutorialActive && currentStep?.tab === 'team'}
            >
              Usuarios
            </Tab>
            <Tab
              $active={tab === 'forms'}
              onClick={() => !tutorialActive && setTab('forms')}
              $tutorial={tutorialActive && currentStep?.tab === 'forms'}
            >
              Formularios
            </Tab>
            <Tab
              $active={tab === 'plan'}
              onClick={() => !tutorialActive && setTab('plan')}
              $tutorial={tutorialActive && currentStep?.tab === 'plan'}
            >
              Planes
            </Tab>
          </Tabs>
          <HelpButton
            onClick={startTutorial}
            title="Iniciar tutorial de configuración"
            disabled={tutorialActive}
          >
            <HelpCircle size={20} />
          </HelpButton>
        </TabsContainer>

        {tab === 'org' && <OrganizationSettingsForm />}
        {tab === 'team' && <TeamSettings />}
        {tab === 'forms' && <ExtraFieldsSettings />}
        {tab === 'plan' && <PlanManagement />}
      </Wrapper>

      {/* Tutorial Component */}
      <SettingsTutorial
        isActive={tutorialActive}
        currentStep={currentStep}
        stepNumber={tutorialStep + 1}
        totalSteps={tutorialSteps.length}
        onNext={nextStep}
        onPrev={prevStep}
        onClose={closeTutorial}
        canGoPrev={tutorialStep > 0}
        isLastStep={tutorialStep === tutorialSteps.length - 1}
      />
    </>
  )
} export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4 pb-4`
const TabsContainer = tw.div`flex justify-between items-center border-b`
const Tabs = tw.div`flex gap-4`
const Tab = tw.button<{ $active?: boolean; $tutorial?: boolean }>`
  pb-2 text-sm font-medium transition-all cursor-pointer relative
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}
  ${({ $tutorial }) => ($tutorial ? 'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-t-md' : '')}
`
const HelpButton = tw.button`
  p-2 
  text-muted-foreground 
  hover:text-primary 
  hover:bg-muted 
  rounded-full 
  transition-all 
  duration-200 
  cursor-pointer
  flex 
  items-center 
  justify-center
  disabled:opacity-50
  disabled:cursor-not-allowed
`


