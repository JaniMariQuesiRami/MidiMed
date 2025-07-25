'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'
import BottomTabs from '@/components/BottomTabs'
import BrandLogo from '@/components/BrandLogo'
import NotificationBellPopover from '@/components/NotificationBellPopover'
import MobileUserSettings from '@/components/MobileUserSettings'
import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'
import tw from 'tailwind-styled-components'

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <LayoutWrapper>
      <SidebarWrapper>
        <Sidebar />
      </SidebarWrapper>
      <ContentWrapper>
        <MobileHeader>
          <BrandLogo />
          <ActionsWrapper>
            <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ThemeToggle>
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
  min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground pt-5
`

const SidebarWrapper = tw.div`
  hidden md:block transition-all
`

const ContentWrapper = tw.main`
  flex-1 p-2 md:p-6 overflow-auto pb-20 md:pb-6
  pt-[56px]
`

const MobileHeader = tw.div`
  md:hidden py-2 px-3 flex items-center gap-4
  fixed top-0 left-0 right-0 z-20
  bg-gradient-to-b from-background/100 to-background/50 pt-10
`

const ActionsWrapper = tw.div`ml-auto flex items-center gap-2`

const BottomTabsWrapper = tw.div`
  md:hidden fixed bottom-0 left-0 w-full border-t border-border bg-background
`
const ThemeToggle = tw.button`p-1 rounded hover:bg-muted cursor-pointer`
