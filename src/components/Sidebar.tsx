'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import UserSettings from '@/components/UserSettings'
import SidebarNotificationsPanel from './SidebarNotificationsPanel'
import tw from 'tailwind-styled-components'

const navItems = [
  { href: '/dashboard', label: 'Calendario', icon: Calendar },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Wrapper $collapsed={collapsed}>
      <TopSection>
        {collapsed ? (
          <>
            <CollapsedLogoWrapper>
              <Logo src="/logoPrimary.svg" alt="Logo" width={28} height={28} />
            </CollapsedLogoWrapper>
            <ToggleFloating onClick={() => setCollapsed(false)}>
              <ChevronsRight size={18} />
            </ToggleFloating>
          </>
        ) : (
          <BrandRow>
            <div className="flex items-center gap-2">
              <Logo src="/logoPrimary.svg" alt="Logo" width={28} height={28} />
              <BrandText>MidiMed</BrandText>
            </div>
            <ToggleButton onClick={() => setCollapsed(true)}>
              <ChevronsLeft size={18} />
            </ToggleButton>
          </BrandRow>
        )}

        <NavList>
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavItem key={href} $active={pathname === href} $collapsed={collapsed}>
              <Link
                href={href}
                className={`flex items-center gap-2 w-full ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3 '}`}
              >
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </Link>
            </NavItem>
          ))}
          <SidebarNotificationsPanel collapsed={collapsed} />
        </NavList>
      </TopSection>

      <UserSettings collapsed={collapsed} />
    </Wrapper>
  )
}

// styled components
const Wrapper = tw.div<{ $collapsed: boolean }>`
  relative h-full flex flex-col justify-between  transition-all
  ${({ $collapsed }) => ($collapsed ? 'w-16 p-2' : 'w-64 p-3')}
  border-r border-sidebar-border bg-sidebar text-sidebar-foreground
`

const TopSection = tw.div`flex flex-col gap-8`

const BrandRow = tw.div`flex items-center justify-between pl-1 py-2`
const BrandText = tw.span`text-primary text-lg font-semibold`
const Logo = tw(Image)`shrink-0`

const CollapsedLogoWrapper = tw.div`flex justify-center p-2`

const ToggleButton = tw.button`
  p-1 rounded hover:bg-muted text-muted-foreground
`

const ToggleFloating = tw.button`
  absolute right-[-26.5px] top-8 -translate-y-1/2
  bg-sidebar border-r border-b border-t border-border rounded-r-md
  p-1 hover:bg-muted text-muted-foreground
  transition-all
`

const NavList = tw.div`flex flex-col gap-1`

const NavItem = tw.div<{ $active?: boolean; $collapsed?: boolean }>`
  ${({ $active }) => ($active ? 'bg-primary text-white font-medium' : 'text-muted-foreground hover:bg-muted')}
  rounded-lg transition-colors hover:text-foreground
`
