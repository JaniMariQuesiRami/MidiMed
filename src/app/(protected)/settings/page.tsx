"use client"
import { useState, useEffect, Suspense, useContext } from 'react'
import { useSearchParams } from 'next/navigation'
import OrganizationSettingsForm from '@/components/OrganizationSettingsForm'
import TeamSettings from '@/components/TeamSettings'
import ExtraFieldsSettings from '@/components/ExtraFieldsSettings'
import PlanManagement from '@/components/PlanManagement'
import LoadingSpinner from '@/components/LoadingSpinner'
import { UserContext } from '@/contexts/UserContext'
import { completeOnboardingStep } from '@/db/onboarding'
import tw from 'tailwind-styled-components'

function SettingsContent() {
  const searchParams = useSearchParams()
  const { tenant } = useContext(UserContext)
  const [tab, setTab] = useState<'org' | 'team' | 'forms' | 'plan'>('org')

  useEffect(() => {
    const tabParam = searchParams.get('tab') as 'org' | 'team' | 'forms' | 'plan'
    if (tabParam && ['org', 'team', 'forms', 'plan'].includes(tabParam)) {
      setTab(tabParam)
    }
  }, [searchParams])

  // Completar el paso de visitar settings
  useEffect(() => {
    if (!tenant) return
    if (!tenant.onboarding?.visitSettings) {
      completeOnboardingStep(tenant.tenantId, 'visitSettings').catch((err) =>
        console.error('Error completing onboarding step visitSettings:', err),
      )
    }
  }, [tenant])

  return (
    <Wrapper>
      <Tabs>
        <Tab $active={tab === 'org'} onClick={() => setTab('org')}>
          Organización
        </Tab>
        <Tab $active={tab === 'team'} onClick={() => setTab('team')}>
          Usuarios
        </Tab>
        <Tab $active={tab === 'forms'} onClick={() => setTab('forms')}>
          Formularios
        </Tab>
        <Tab $active={tab === 'plan'} onClick={() => setTab('plan')}>
          Planes
        </Tab>
      </Tabs>
      {tab === 'org' && <OrganizationSettingsForm />}
      {tab === 'team' && <TeamSettings />}
      {tab === 'forms' && <ExtraFieldsSettings />}
      {tab === 'plan' && <PlanManagement />}
    </Wrapper>
  )
}

export default function SettingsPage() {
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
const Tabs = tw.div`flex gap-4 border-b`
const Tab = tw.button<{ $active?: boolean }>`pb-2 text-sm font-medium transition-colors cursor-pointer
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`
