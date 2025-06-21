'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import BottomTabs from '@/components/BottomTabs'
import BrandLogo from '@/components/BrandLogo'
import NotificationBellPopover from '@/components/NotificationBellPopover'
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
          <BellWrapper>
            <NotificationBellPopover />
          </BellWrapper>
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
  min-h-screen flex flex-col md:flex-row bg-background/60 backdrop-blur-lg text-foreground
`

const SidebarWrapper = tw.div`
  hidden md:block transition-all backdrop-blur-lg bg-sidebar/60 border-r border-sidebar-border/40
`

const ContentWrapper = tw.main`
  flex-1 p-2 md:p-6 bg-background/60 backdrop-blur-md
`

const MobileHeader = tw.div`
  md:hidden py-2 px-3 flex items-center gap-4 bg-background/60 backdrop-blur-lg border-b border-border/40
`

const BellWrapper = tw.div`ml-auto`

const BottomTabsWrapper = tw.div`
  md:hidden fixed bottom-0 left-0 w-full border-t border-border/40 bg-background/60 backdrop-blur-lg
`
