'use client'

import Image from 'next/image'
import tw from 'tailwind-styled-components'
import { useEffect, useState } from 'react'

export default function BrandLogo() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  return (
    <Wrapper>
      <Image 
        src={isMobile ? "/logoPrimary.svg" : "/logo.svg"}
        alt="Logo" 
        width={28} 
        height={28} 
      />
      <BrandText $isMobile={isMobile}>MidiMed</BrandText>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex items-center gap-2
`

const BrandText = tw.span<{ $isMobile: boolean }>`
  text-lg font-semibold
  ${({ $isMobile }) => $isMobile ? 'text-primary' : 'text-white/80'}
`
