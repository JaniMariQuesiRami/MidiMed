"use client"
import Link from 'next/link'
import tw from 'tailwind-styled-components'
import BrandLogo from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import LandingCarousel from '@/components/LandingCarousel'
import Particles from '@/components/Particles'
import { Copyright } from 'lucide-react'
import Image from 'next/image'
import './shine.css'

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  return (
    <Wrapper>
      {/* Particles Background */}
      <ParticlesContainer>
        <Particles
          particleColors={['#3abdd4', '#5cc8db', '#7dd3e2', '#71cbe2ff']}
          particleCount={2000}
          particleSpread={10}
          speed={0.05}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          alphaParticles={true}
          disableRotation={false}
          sizeRandomness={0.8}
          cameraDistance={25}
        />
      </ParticlesContainer>
      
      <Header>
        <BrandLogo />
        <div className="flex items-center gap-2">
          <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </ThemeToggle>
          <nav className="flex gap-2">
          <Button
            asChild
            variant="secondary"
            className="bg-primary text-white hover:bg-primary/50 relative overflow-hidden shine-btn"
          >
            <Link href="/signup">Crear cuenta</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Log In</Link>
          </Button>
          </nav>
        </div>
      </Header>
      <Main>
        <div className="flex flex-col gap-8 flex-1">
          <Headline>
            Gestiona fácilmente tus pacientes, citas y expedientes médicos.
          </Headline>
          <LandingCarousel />
        </div>
        <Screenshot>
          <Image src="/phoneScreenshot.svg" alt="Captura de pantalla de la app" width={400} height={800} className="rounded-lg max-h-150" />
        </Screenshot>
      </Main>
      <Footer>
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Copyright className="w-4 h-4" /> MIDI 2025
        </span>
      </Footer>
    </Wrapper>
  )
}

const Wrapper = tw.div`min-h-[100dvh] flex flex-col relative`
const ParticlesContainer = tw.div`absolute inset-0 w-full h-full pointer-events-none z-0`
const Header = tw.header`flex items-center justify-between px-6 py-4 mb-16 relative z-10`
const Main = tw.main`flex flex-col sm:flex-row gap-8 flex-1 items-start px-8 relative z-10`
const Headline = tw.h1`text-4xl sm:text-5xl font-bold max-w-xl`
const Screenshot = tw.div`
  hidden sm:flex items-center justify-center flex-1
  rounded-xl border-primary p-4 h-auto bg-transparent
`
const Footer = tw.footer`flex justify-end px-6 py-4 relative z-10`
const ThemeToggle = tw.button`p-1 rounded hover:bg-muted`
