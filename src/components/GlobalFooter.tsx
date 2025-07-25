'use client'

import { Copyright } from 'lucide-react'
import tw from 'tailwind-styled-components'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'

export default function GlobalFooter() {
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { theme } = useTheme()

  // Páginas donde el texto debe ser blanco y el logo normal en mobile
  const forceWhitePages = ['/pricing', '/contactanos', '/login', '/signup']
  const forceWhiteText = forceWhitePages.some((p) => pathname?.startsWith(p)) || pathname === '/'
  
  // Detectar si estamos en rutas protegidas (dashboard, patients, etc.)
  const isProtectedRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/patients') || 
                          pathname?.startsWith('/reports') || 
                          pathname?.startsWith('/notifications') || 
                          pathname?.startsWith('/settings')

  // No mostrar en mobile si estamos en rutas protegidas (para no chocar con BottomTabs)
  const shouldHide = isMobile && isProtectedRoute

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // No renderizar si debe estar oculto
  if (shouldHide) return null

  return (
    <Footer>
      <FooterText $isMobile={isMobile} $forceWhiteText={forceWhiteText} $isDark={theme === 'dark'}>
        <Copyright className="w-4 h-4" /> MIDI 2025
      </FooterText>
    </Footer>
  )
}

const Footer = tw.footer`
  fixed bottom-0 right-0 z-30 px-6 py-4
  pointer-events-none
`

const FooterText = tw.span<{ $isMobile: boolean, $forceWhiteText?: boolean, $isDark?: boolean }>`
  flex items-center gap-1 text-sm
  ${({ $isMobile, $forceWhiteText, $isDark }) => {
    if ($isMobile && $forceWhiteText) return 'text-white/80'
    if ($isMobile) return 'text-primary'
    if ($isDark) return 'text-white/80'
    return 'text-gray-700'
  }}
`
