"use client"
import tw from 'tailwind-styled-components'
import SharedHeader from '@/components/SharedHeader'
import { useTheme } from '@/contexts/ThemeContext'
import LandingCarousel from '@/components/LandingCarousel'
import Iridescence from '@/components/Iridescence'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'
import { trackEvent } from '@/utils/trackEvent'
import './shine.css'

export default function Home() {
  const { theme } = useTheme()
  const { user, tenant } = useUser()

  useEffect(() => {
    trackEvent('Visited Landing Page', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
  }, [user?.uid, tenant?.tenantId])
  return (
    <Wrapper>
      {/* Iridescence Background */}
      <BackgroundContainer>
        <Iridescence
          speed={0.3}
          amplitude={0.08}
          mouseReact={true}
        />
      </BackgroundContainer>
      
      <SharedHeader currentPage="landing" />
      
      <Main>
        <div className="flex flex-col gap-4 flex-1">
          <Headline>
            Gestiona fácilmente tus pacientes, citas y expedientes médicos.
          </Headline>
          <CTASection>
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              <Link href="/signup">
                Empieza gratis!
              </Link>
            </Button>
          </CTASection>
          <LandingCarousel />
        </div>
        <Screenshot>
          <Image 
            src={theme === 'dark' ? "/mobileDark.svg" : "/mobileLight.svg"} 
            alt="Captura de pantalla de la app" 
            width={400} 
            height={800} 
            className="rounded-lg max-h-150" 
          />
        </Screenshot>
      </Main>
    </Wrapper>
  )
}

const Wrapper = tw.div`min-h-[100dvh] flex flex-col relative`
const BackgroundContainer = tw.div`absolute inset-0 w-full h-full pointer-events-none z-0`
const Main = tw.main`flex flex-col sm:flex-row gap-8 flex-1 items-start px-8 relative z-10`
const Headline = tw.h1`text-4xl sm:text-5xl font-bold max-w-xl text-white`
const CTASection = tw.div`flex justify-start`
const Screenshot = tw.div`
  hidden sm:flex items-center justify-center flex-1
  rounded-xl border-primary p-4 h-auto bg-transparent
`
