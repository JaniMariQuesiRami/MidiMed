'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import BottomTabs from '@/components/BottomTabs'
import tw from 'tailwind-styled-components'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <ContentWrapper>
        {children}
      </ContentWrapper>
      <BottomTabsWrapper>
        <BottomTabs />
      </BottomTabsWrapper>
    </LayoutWrapper>
  )
}

// styled components
const LayoutWrapper = tw.div`
  min-h-screen flex flex-col md:flex-row bg-background text-foreground
`

const SidebarWrapper = tw.div`
  hidden md:block transition-all
`

const ContentWrapper = tw.main`
  flex-1 p-4 md:p-6
`

const BottomTabsWrapper = tw.div`
  md:hidden fixed bottom-0 left-0 w-full border-t border-border bg-background
`