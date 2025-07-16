"use client"
import { useState } from 'react'
import OrganizationSettingsForm from '@/components/OrganizationSettingsForm'
import TeamSettings from '@/components/TeamSettings'
import tw from 'tailwind-styled-components'

export default function SettingsPage() {
  const [tab, setTab] = useState<'org' | 'team'>('org')

  return (
    <Wrapper>
      <Tabs>
        <Tab $active={tab === 'org'} onClick={() => setTab('org')}>
          Organización
        </Tab>
        <Tab $active={tab === 'team'} onClick={() => setTab('team')}>
          Usuarios
        </Tab>
      </Tabs>
      {tab === 'org' ? <OrganizationSettingsForm /> : <TeamSettings />}
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4 pb-4`
const Tabs = tw.div`flex gap-4 border-b`
const Tab = tw.button<{ $active?: boolean }>`pb-2 text-sm font-medium transition-colors
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`
