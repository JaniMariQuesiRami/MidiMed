import Image from 'next/image'
import Link from 'next/link'
import tw from 'tailwind-styled-components'

import { Button } from '@/components/ui/button'
import LandingCarousel from '@/components/LandingCarousel'

export default function Home() {
  return (
    <Wrapper>
      <Header>
        <Logo src="/logo.svg" alt="MidiMed logo" width={64} height={64} />
      </Header>
      <Main>
        <Headline>
          Easily manage your patients, appointments, and medical records.
        </Headline>
        <LandingCarousel />
        <ButtonGroup>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link href="/login">Login</Link>
          </Button>
        </ButtonGroup>
      </Main>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex flex-col items-center justify-start min-h-screen gap-8 p-4 sm:p-8 bg-gradient-to-tr from-[#0589c2] via-[#3abdd4] to-[#93efff] animate-gradient
`

const Header = tw.header`pt-6`

const Logo = tw(Image)`mx-auto`

const Main = tw.main`flex flex-col items-center justify-center gap-8 flex-1 w-full`

const Headline = tw.h1`text-3xl sm:text-4xl font-bold text-center text-white max-w-2xl`

const ButtonGroup = tw.div`flex flex-col sm:flex-row gap-4`
