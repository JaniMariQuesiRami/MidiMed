'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  BarChart3,
} from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import UserSettings from '@/components/UserSettings'
import tw from 'tailwind-styled-components'
import { useContext, useEffect } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { listenToNotifications } from '@/db/notifications'

const navItems = [
  { href: '/dashboard', label: 'Calendario', icon: Calendar },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/notifications', label: 'Notificaciones', icon: Bell },
  { href: '/reports', label: 'Reportes', icon: BarChart3 },
  { href: '/settings', label: 'Ajustes', icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps = {}) {
  const pathname = usePathname()
  const { user, tenant } = useContext(UserContext)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleToggleCollapsed = (newCollapsed: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(newCollapsed)
    }
  }

  useEffect(() => {
    if (!user || !tenant) return

    const unsub = listenToNotifications(
      user.uid,
      tenant.tenantId,
      { archived: false, limit: 50 },
      (notifications) => {
        const unread = notifications.filter((n) => !n.isRead).length
        setUnreadCount(unread)
      }
    )

    return () => unsub()
  }, [user, tenant])

  return (
    <Wrapper $collapsed={collapsed}>
      <TopSection>
        {collapsed ? (
          <>
            <CollapsedLogoWrapper>
              <Logo src="/logoPrimary.svg" alt="Logo" width={28} height={28} />
            </CollapsedLogoWrapper>
            <ToggleFloating onClick={() => handleToggleCollapsed(false)}>
              <ChevronsRight size={18} />
            </ToggleFloating>
          </>
        ) : (
          <BrandRow>
            <div className="flex items-center gap-2">
              <Logo src="/logoPrimary.svg" alt="Logo" width={28} height={28} />
              <BrandText>MidiMed</BrandText>
            </div>
            <ToggleButton onClick={() => handleToggleCollapsed(true)}>
              <ChevronsLeft size={18} />
            </ToggleButton>
          </BrandRow>
        )}

        <NavList>
          {navItems.map(({ href, label, icon: Icon }) => (
            <NavItem key={href} $active={pathname === href} $collapsed={collapsed}>
              <Link
                href={href}
                className={`flex items-center gap-2 w-full relative ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3 '}`}
              >
                <div className="flex items-center gap-2 w-full justify-center">
                  <Icon size={20} />
                  {!collapsed && <>
                    <span className="flex-1">{label}</span>
                    {href === '/notifications' && unreadCount > 0 && (
                      <NotificationBadge>{unreadCount > 9 ? '9+' : unreadCount}</NotificationBadge>
                    )}
                  </>}
                </div>
              </Link>
            </NavItem>
          ))}
        </NavList>
      </TopSection>

      <UserSettings collapsed={collapsed} />
    </Wrapper>
  )
}

// styled components
const Wrapper = tw.div<{ $collapsed: boolean }>`
  relative h-screen flex flex-col justify-between transition-all
  ${({ $collapsed }) => ($collapsed ? 'w-16 p-2' : 'w-64 p-3')}
  border-r border-sidebar-border bg-sidebar text-sidebar-foreground
  overflow-hidden
`

const TopSection = tw.div`flex flex-col gap-8`

const BrandRow = tw.div`flex items-center justify-between pl-1 py-2`
const BrandText = tw.span`text-primary text-lg font-semibold`
const Logo = tw(Image)`shrink-0`

const CollapsedLogoWrapper = tw.div`flex justify-center p-2`

const ToggleButton = tw.button`
  p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer
`

const ToggleFloating = tw.button`
  absolute right-[-26.5px] top-8 -translate-y-1/2
  bg-sidebar border-r border-b border-t border-border rounded-r-md
  p-1 hover:bg-muted text-muted-foreground cursor-pointer
  transition-all
`

const NavList = tw.div`flex flex-col gap-1`

const NavItem = tw.div<{ $active?: boolean; $collapsed?: boolean }>`
  ${({ $active }) => ($active ? 'bg-primary text-white font-medium' : 'text-muted-foreground hover:bg-muted')}
  rounded-lg transition-colors hover:text-foreground
`

const NotificationBadge = tw.span`
  ml-2 h-4 w-4 text-xs font-medium text-white 
  bg-red-500 rounded-full flex items-center justify-center
  p-0 m-0 leading-none
`
