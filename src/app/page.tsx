import Link from 'next/link'
import tw from 'tailwind-styled-components'
import BrandLogo from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import LandingCarousel from '@/components/LandingCarousel'
import { Copyright } from 'lucide-react'
import Image from 'next/image'
import './shine.css'

export default function Home() {
  return (
    <Wrapper>
      <Header>
        <BrandLogo />
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

const Wrapper = tw.div`min-h-[100dvh] flex flex-col`
const Header = tw.header`flex items-center justify-between px-6 py-4 mb-16`
const Main = tw.main`flex flex-col sm:flex-row gap-8 flex-1 items-start px-8`
const Headline = tw.h1`text-4xl sm:text-5xl font-bold max-w-xl`
const Screenshot = tw.div`
  hidden sm:flex items-center justify-center flex-1
  rounded-xl border-primary p-4 h-auto bg-transparent
`
const Footer = tw.footer`flex justify-end px-6 py-4`
