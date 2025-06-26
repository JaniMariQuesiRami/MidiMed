'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, FileText, BarChart2, MessageCircle, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import tw from 'tailwind-styled-components'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const features = [
  { icon: CalendarDays, text: 'Smart appointment scheduling.' },
  { icon: FileText, text: 'Patient medical record management.' },
  { icon: BarChart2, text: 'Clinical statistics and reports.' },
  { icon: MessageCircle, text: 'Automated patient chat.' },
  { icon: ShieldCheck, text: 'Compliance with medical regulations.' },
]

export default function LandingCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % features.length), 4000)
    return () => clearInterval(id)
  }, [])

  const prev = () => setIndex(i => (i - 1 + features.length) % features.length)
  const next = () => setIndex(i => (i + 1) % features.length)

  const FeatureIcon = features[index].icon

  return (
    <Wrapper>
      <Slide>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <FeatureIcon className="w-12 h-12 text-primary" />
          <p className="text-lg text-center font-medium">
            {features[index].text}
          </p>
        </CardContent>
      </Slide>
      <Nav $position="left" onClick={prev} variant="ghost" size="icon">
        <ChevronLeft className="w-6 h-6" />
      </Nav>
      <Nav $position="right" onClick={next} variant="ghost" size="icon">
        <ChevronRight className="w-6 h-6" />
      </Nav>
    </Wrapper>
  )
}

const Wrapper = tw(Card)`relative overflow-hidden w-full`
const Slide = tw.div`w-full h-full flex items-center justify-center`
const Nav = tw(Button)<{ $position: 'left' | 'right' }>`
  absolute top-1/2 -translate-y-1/2 z-10
  ${(p) => (p.$position === 'left' ? 'left-2' : 'right-2')}
`

