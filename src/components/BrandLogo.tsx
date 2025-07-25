'use client'

import Image from 'next/image'
import tw from 'tailwind-styled-components'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function BrandLogo() {
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  // Páginas donde el texto debe ser blanco y el logo normal en mobile
  const forceWhitePages = ['/pricing', '/contact', '/login', '/signup']
  const forceWhiteText = forceWhitePages.some((p) => pathname?.startsWith(p)) || pathname === '/'

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const showLogo = isMobile && forceWhiteText ? "/logo.svg" : isMobile ? "/logoPrimary.svg" : "/logo.svg"

  return (
    <Wrapper>
      <Image 
        src={showLogo}
        alt="Logo" 
        width={28} 
        height={28} 
      />
      <BrandText $isMobile={isMobile} $forceWhiteText={forceWhiteText}>MidiMed</BrandText>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex items-center gap-2
`

const BrandText = tw.span<{ $isMobile: boolean, $forceWhiteText?: boolean }>`
  text-lg font-semibold
  ${({ $isMobile, $forceWhiteText }) =>
    $isMobile && $forceWhiteText ? 'text-white/80' : $isMobile ? 'text-primary' : 'text-white/80'}
`
