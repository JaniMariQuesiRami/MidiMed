'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, Bell, Settings } from 'lucide-react'
import tw from 'tailwind-styled-components'

const tabs = [
  { href: '/dashboard', icon: <Calendar size={20} />, label: 'Inicio' },
  { href: '/patients', icon: <Users size={20} />, label: 'Pacientes' },
  { href: '/notifications', icon: <Bell size={20} />, label: 'Notificaciones' },
  { href: '/settings', icon: <Settings size={20} />, label: 'Ajustes' },
]

export default function BottomTabs() {
  const pathname = usePathname()

  return (
    <Wrapper>
      {tabs.map(({ href, icon }, idx) => (
        <TabLink key={idx} href={href} $active={pathname === href}>
          {icon}
        </TabLink>
      ))}
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex justify-around items-center h-14
`

const TabLink = tw(Link)<{ $active?: boolean }>`
  p-2 transition-colors
  ${({ $active }) => ($active ? 'text-foreground' : 'text-muted-foreground')}
`
