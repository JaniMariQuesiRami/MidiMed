"use client"
import tw from 'tailwind-styled-components'
import SharedHeader from '@/components/SharedHeader'
import { useTheme } from '@/contexts/ThemeContext'
import LandingCarousel from '@/components/LandingCarousel'
import Iridescence from '@/components/Iridescence'
import { Copyright } from 'lucide-react'
import Image from 'next/image'
import './shine.css'

export default function Home() {
  const { theme } = useTheme()
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
        <div className="flex flex-col gap-8 flex-1">
          <Headline>
            Gestiona fácilmente tus pacientes, citas y expedientes médicos.
          </Headline>
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
      <Footer>
        <span className="flex items-center gap-1 text-sm text-white/80">
          <Copyright className="w-4 h-4" /> MIDI 2025
        </span>
      </Footer>
    </Wrapper>
  )
}

const Wrapper = tw.div`min-h-[100dvh] flex flex-col relative`
const BackgroundContainer = tw.div`absolute inset-0 w-full h-full pointer-events-none z-0`
const Main = tw.main`flex flex-col sm:flex-row gap-8 flex-1 items-start px-8 relative z-10`
const Headline = tw.h1`text-4xl sm:text-5xl font-bold max-w-xl text-white`
const Screenshot = tw.div`
  hidden sm:flex items-center justify-center flex-1
  rounded-xl border-primary p-4 h-auto bg-transparent
`
const Footer = tw.footer`flex justify-end px-6 py-4 relative z-10`
