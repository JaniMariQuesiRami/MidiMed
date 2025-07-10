"use client"
import { useState } from 'react'
import OrganizationSettingsForm from '@/components/OrganizationSettingsForm'
import TeamSettings from '@/components/TeamSettings'
import ReportsDashboard from '@/components/ReportsDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import tw from 'tailwind-styled-components'

export default function SettingsPage() {
  const [tab, setTab] = useState('org')

  return (
    <Wrapper>
      <Tabs value={tab} onValueChange={(v) => setTab(v)}>
        <TabsList className="border-b">
          <TabsTrigger value="org">Organización</TabsTrigger>
          <TabsTrigger value="team">Usuarios</TabsTrigger>
          <TabsTrigger value="reports" className="hidden md:inline-flex">
            Reportes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="org">
          <OrganizationSettingsForm />
        </TabsContent>
        <TabsContent value="team">
          <TeamSettings />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsDashboard />
        </TabsContent>
      </Tabs>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
