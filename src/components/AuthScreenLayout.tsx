'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import tw from 'tailwind-styled-components'

type Props = {
  children: React.ReactNode
}

export default function AuthScreenLayout({ children }: Props) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [velocity, setVelocity] = useState({ vx: 1.5, vy: 1.2 })

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
      <BouncingLogo
        src="/logo.svg"
        alt="Logo"
        width={60}
        height={60}
        style={{ top: position.y, left: position.x }}
      />
      <AuthFormWrapper>{children}</AuthFormWrapper>
    </Background>
  )
}

// Styled components
export const Background = tw.div`
  relative min-h-screen w-full flex items-center justify-center overflow-hidden
  bg-gradient-to-tr from-[#0589c2] via-[#3abdd4] to-[#93efff] animate-gradient
`

export const BouncingLogo = tw(Image)`
  fixed z-10 transition-transform duration-100 ease-linear pointer-events-none
`

export const AuthFormWrapper = tw.div`
  z-20 relative w-full glass shadow-lg p-6 rounded-2xl backdrop-blur-xl
`
