"use client"
import { useState } from 'react'
import OrganizationSettingsForm from '@/components/OrganizationSettingsForm'
import TeamSettings from '@/components/TeamSettings'
import ExtraFieldsSettings from '@/components/ExtraFieldsSettings'
import PlanDetailsPanel from '@/components/PlanDetailsPanel'
import tw from 'tailwind-styled-components'

export default function SettingsPage() {
  const [tab, setTab] = useState<'org' | 'team' | 'forms' | 'plan'>('org')

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
      {tab === 'plan' && <PlanDetailsPanel />}
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4 pb-4`
const Tabs = tw.div`flex gap-4 border-b`
const Tab = tw.button<{ $active?: boolean }>`pb-2 text-sm font-medium transition-colors cursor-pointer
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`
