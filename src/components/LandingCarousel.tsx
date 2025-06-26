'use client'

import { CalendarDays, User2, BarChart3, MessageSquare, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselAutoplay,
} from '@/components/ui/carousel'
import tw from 'tailwind-styled-components'

const slides = [
  { icon: CalendarDays, text: 'Smart appointment scheduling.' },
  { icon: User2, text: 'Patient medical record management.' },
  { icon: BarChart3, text: 'Clinical statistics and reports.' },
  { icon: MessageSquare, text: 'Automated patient chat.' },
  { icon: ShieldCheck, text: 'Compliance with medical regulations.' },
]

export default function LandingCarousel() {
  return (
    <Wrapper>
      <Carousel
        opts={{ loop: true }}
        plugins={[CarouselAutoplay({ delay: 3000 })]}
        className="w-full max-w-md"
      >
        <CarouselContent>
          {slides.map((slide, idx) => (
            <CarouselItem key={idx}>
              <Card className="text-center h-40 flex flex-col justify-center items-center">
                <CardHeader>
                  <slide.icon className="mx-auto h-8 w-8 text-primary" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base font-medium">{slide.text}</CardTitle>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </Wrapper>
  )
}

const Wrapper = tw.div`w-full flex justify-center`
