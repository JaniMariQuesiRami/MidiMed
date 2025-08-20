'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import tw from 'tailwind-styled-components'
import SharedHeader from '@/components/SharedHeader'
import ContactSection from '@/components/ContactSection'
import { useUser } from '@/contexts/UserContext'
import { trackEvent } from '@/utils/trackEvent'

export default function ContactPage() {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ vx: 1.5, vy: 1.2 })
  const { user, tenant } = useUser()

  useEffect(() => {
    const move = () => {
      setPosition((prev) => {
        const { x, y } = prev
        let { vx, vy } = velocity

        if (x + 80 >= window.innerWidth || x <= 0) vx *= -1
        if (y + 80 >= window.innerHeight || y <= 0) vy *= -1

        setVelocity({ vx, vy })
        return { x: x + vx, y: y + vy }
      })
    }

    const interval = setInterval(move, 10)
    return () => clearInterval(interval)
  }, [velocity])

  useEffect(() => {
    trackEvent('Visited Contact Page', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
  }, [user?.uid, tenant?.tenantId])

  return (
    <Background>
      <HeaderContainer>
        <SharedHeader showAuthButtons={true} />
      </HeaderContainer>
      <ContentArea>
        <BouncingLogo
          src="/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          style={{ top: position.y, left: position.x }}
        />
        <ContactSection />
      </ContentArea>
    </Background>
  )
}

// Styled components
const Background = tw.div`
  relative min-h-screen w-full flex flex-col overflow-hidden
`

const HeaderContainer = tw.div`
  relative z-30 w-full shrink-0
`

const ContentArea = tw.div`
  flex-1 relative w-full min-h-0 p-4
`

const BouncingLogo = tw(Image)`
  fixed z-10 transition-transform duration-100 ease-linear pointer-events-none
`
