import Image from 'next/image'
import Link from 'next/link'
import tw from 'tailwind-styled-components'
import { Button } from '@/components/ui/button'
import LandingCarousel from '@/components/LandingCarousel'

export default function Home() {
  return (
    <Wrapper>
      <header className="w-full flex justify-center py-6">
        <Image src="/logo.svg" alt="MidiMed logo" width={60} height={60} />
      </header>
      <main className="flex flex-col items-center gap-10 text-center flex-1 w-full">
        <Headline>
          Easily manage your patients, appointments, and medical records.
        </Headline>
        <LandingCarousel />
        <Actions>
          <Link href="/signup">
            <Button size="lg">Sign Up</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
        </Actions>
      </main>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  min-h-screen flex flex-col items-center px-4 pb-10 md:pb-20 bg-background text-foreground
`

const Headline = tw.h1`
  text-3xl md:text-5xl font-bold max-w-xl
`

const Actions = tw.div`
  flex flex-col sm:flex-row gap-4
`

