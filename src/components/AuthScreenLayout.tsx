'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import tw from 'tailwind-styled-components'
import SharedHeader from '@/components/SharedHeader'

type Props = {
  children: React.ReactNode
}

export default function AuthScreenLayout({ children }: Props) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ vx: 1.5, vy: 1.2 })
  const pathname = usePathname()

  // Determine current page for header
  const currentPage = pathname === '/login' ? 'login' : pathname === '/signup' ? 'signup' : 'landing'

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

  return (
    <Background>
      <HeaderContainer>
        <SharedHeader currentPage={currentPage as 'login' | 'signup'} />
      </HeaderContainer>
      <ContentArea>
        <BouncingLogo
          src="/logo.svg"
          alt="Logo"
          width={60}
          height={60}
          style={{ top: position.y, left: position.x }}
        />
        <AuthFormWrapper>{children}</AuthFormWrapper>
      </ContentArea>
    </Background>
  )
}

// Styled components
export const Background = tw.div`
  relative h-screen w-full flex flex-col overflow-hidden
  bg-gradient-to-tr from-[#0589c2] via-[#3abdd4] to-[#93efff] animate-gradient
  dark:from-[#0d1421] dark:via-[#1a2332] dark:to-[#2a3441]
`

export const HeaderContainer = tw.div`
  relative z-30 w-full shrink-0
`

export const ContentArea = tw.div`
  flex-1 flex items-center justify-center relative w-full min-h-0
`

export const BouncingLogo = tw(Image)`
  fixed z-10 transition-transform duration-100 ease-linear pointer-events-none
`

export const AuthFormWrapper = tw.div`
  z-20 relative w-full
`
