'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  FileText,
  BarChart2,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import tw from 'tailwind-styled-components'
import { cn } from '@/lib/utils'

const features = [
  { icon: CalendarDays, text: 'Agendamiento inteligente de citas.' },
  { icon: FileText, text: 'Gestión de historias clínicas de pacientes.' },
  { icon: BarChart2, text: 'Estadísticas y reportes clínicos.' },
  { icon: MessageCircle, text: 'Chat automatizado con pacientes.' },
  { icon: ShieldCheck, text: 'Cumplimiento de normativas médicas.' },
]

export default function LandingCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % features.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const getItem = (offset: number) => {
    const i = (index + offset + features.length) % features.length
    return features[i]
  }

  return (
    <Wrapper>
      {[ -1, 0, 1 ].map(offset => {
        const item = getItem(offset)
        const Icon = item.icon

        return (
          <CardWrapper
            key={offset}
            className={cn(
              'absolute w-full transition-all duration-700 ease-in-out flex flex-col items-center justify-center',
              offset === 0 && 'z-30 translate-y-0 scale-100 opacity-100',
              offset === -1 && 'z-20 -translate-y-24 scale-95 opacity-40 bg-muted',
              offset === 1 && 'z-10 translate-y-24 scale-95 opacity-40 bg-muted'
            )}
          >
            <Icon className="w-8 h-8 text-primary mb-2" />
            <p className="text-center text-base font-medium">{item.text}</p>
          </CardWrapper>
        )
      })}
    </Wrapper>
  )
}

// Styled Components
const Wrapper = tw.div`
  relative h-[460px] w-full overflow-hidden flex items-center justify-center
`

const CardWrapper = tw.div`
  w-[320px] h-[200px] bg-background rounded-xl shadow-lg border border-border
`
