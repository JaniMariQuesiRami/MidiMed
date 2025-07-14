'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import BottomTabs from '@/components/BottomTabs'
import BrandLogo from '@/components/BrandLogo'
import NotificationBellPopover from '@/components/NotificationBellPopover'
import MobileUserSettings from '@/components/MobileUserSettings'
import tw from 'tailwind-styled-components'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <LayoutWrapper>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <ContentWrapper>
        <MobileHeader>
          <BrandLogo />
          <ActionsWrapper>
            <NotificationBellPopover />
            <MobileUserSettings />
          </ActionsWrapper>
        </MobileHeader>
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
  min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground
`

const SidebarWrapper = tw.div`
  hidden md:block transition-all
`

const ContentWrapper = tw.main`
  flex-1 p-2 md:p-6 overflow-auto max-h-[100dvh]
`

const MobileHeader = tw.div`
  md:hidden py-2 px-3 flex items-center gap-4
`

const ActionsWrapper = tw.div`ml-auto flex items-center gap-2`

const BottomTabsWrapper = tw.div`
  md:hidden fixed bottom-0 left-0 w-full border-t border-border bg-background
`
