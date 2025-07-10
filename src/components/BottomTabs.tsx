'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Users, Bell, Settings, Home } from 'lucide-react'
import tw from 'tailwind-styled-components'

const tabs = [
  { href: '/dashboard', icon: <Home size={20} />, label: 'Inicio' },
  { href: '/patients', icon: <Users size={20} />, label: 'Pacientes' },
  { href: '/settings', icon: <Settings size={20} />, label: 'Ajustes' },
]

export default function BottomTabs() {
  const pathname = usePathname()

  const isTabActive = (href: string) => {
    if (href === '/patients') {
      // Keep patients tab active for all patient-related pages
      return pathname.startsWith('/patients')
    }
    return pathname === href
  }

  return (
    <Wrapper>
      {tabs.map(({ href, icon }, idx) => (
        <TabLink key={idx} href={href} $active={isTabActive(href)}>
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
  ${({ $active }) => ($active ? 'text-[color:var(--primary)]' : 'text-muted-foreground')}
`

