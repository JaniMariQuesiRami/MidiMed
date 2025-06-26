'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar, FolderHeart, BarChart2, MessageCircle, ShieldCheck } from 'lucide-react'
import tw from 'tailwind-styled-components'

const slides = [
  { icon: Calendar, text: 'Smart appointment scheduling.' },
  { icon: FolderHeart, text: 'Patient medical record management.' },
  { icon: BarChart2, text: 'Clinical statistics and reports.' },
  { icon: MessageCircle, text: 'Automated patient chat.' },
  { icon: ShieldCheck, text: 'Compliance with medical regulations.' },
]

export default function LandingCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const prev = () => setIndex((index - 1 + slides.length) % slides.length)
  const next = () => setIndex((index + 1) % slides.length)

  const CurrentIcon = slides[index].icon

  return (
    <Wrapper>
      <ArrowButton onClick={prev} aria-label="Previous slide">
        <ChevronLeft />
      </ArrowButton>
      <Card className="w-full max-w-xs sm:max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <CurrentIcon className="size-12 text-primary" />
          <p className="text-center text-lg font-medium">
            {slides[index].text}
          </p>
        </CardContent>
      </Card>
      <ArrowButton onClick={next} aria-label="Next slide">
        <ChevronRight />
      </ArrowButton>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex items-center gap-4
`

const ArrowButton = tw(Button)`
  rounded-full border bg-secondary hover:bg-secondary/80 text-foreground
`
