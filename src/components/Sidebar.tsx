'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useState } from 'react'
import UserSettings from '@/components/UserSettings'
import tw from 'tailwind-styled-components'

const navItems = [
  { href: '/dashboard', label: 'Calendario', icon: Calendar },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Wrapper $collapsed={collapsed}>
      <div>
        <ToggleWrapper>
          <ToggleButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
          </ToggleButton>
        </ToggleWrapper>

        <NavList>
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavItem key={href} $active={pathname === href} $collapsed={collapsed}>
              <Link
                href={href}
                className={`flex items-center gap-2 px-4 py-3 w-full ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{label}</span>}
              </Link>
            </NavItem>
          ))}
        </NavList>
      </div>

      <UserSettings collapsed={collapsed} />
    </Wrapper>
  )
}

// styled components
const Wrapper = tw.div<{ $collapsed: boolean }>`
  h-full flex flex-col justify-between p-2 transition-all
  ${({ $collapsed }) => ($collapsed ? 'w-16' : 'w-64')}
  border-r border-border
`

const ToggleWrapper = tw.div`
  flex justify-end mb-2
`

const ToggleButton = tw.button`
  p-1 rounded hover:bg-muted text-muted-foreground
`

const NavList = tw.div`
  flex flex-col gap-1
`

const NavItem = tw.div<{ $active?: boolean; $collapsed?: boolean }>`
  ${({ $active }) => ($active ? 'bg-primary text-white font-medium' : 'text-muted-foreground hover:bg-muted ')}
  rounded-lg transition-colors hover:text-foreground
`
