'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import tw from 'tailwind-styled-components'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Star, TestTube, Briefcase, Stethoscope } from 'lucide-react'

interface PricingSectionProps {
  id?: string
  defaultCurrency?: 'USD' | 'GTQ'
}

export default function PricingSection({ id = 'pricing', defaultCurrency = 'USD' }: PricingSectionProps) {
  const [currency, setCurrency] = useState<'USD' | 'GTQ'>(defaultCurrency);
  const router = useRouter()

  const exchangeRate = 8;

  const formatPrice = (usd: number) => {
    if (currency === 'USD') return `$${usd}`
    if (usd === 99.99) return 'Q759.99'
    if (usd === 129.99) return 'Q999.99'
    return `Q${usd * exchangeRate}`
  }

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push('/contact');
    }
  }

  const handleFreeTrialClick = () => {
    router.push('/signup')
  }

  return (
    <Section id={id}>
      <ContentWrapper>
        <Header>
          <Title>Precios</Title>
          <Subtitle>
            Elige el plan perfecto para tí
          </Subtitle>
          <div className="flex justify-center mt-6 mb-2">
            <button
              className={`relative flex items-center px-2 py-1 rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 shadow transition-colors duration-200 focus:outline-none w-28 h-10`}
              onClick={() => setCurrency(currency === 'USD' ? 'GTQ' : 'USD')}
              aria-label="Cambiar moneda"
            >
              <span className={`flex-1 text-center font-semibold transition-colors duration-200 ${currency === 'USD' ? 'text-primary' : 'text-gray-500 dark:text-gray-300'}`}>USD</span>
              <span className={`flex-1 text-center font-semibold transition-colors duration-200 ${currency === 'GTQ' ? 'text-primary' : 'text-gray-500 dark:text-gray-300'}`}>GTQ</span>
            </button>
          </div>
        </Header>

        <PricingGrid>
          {/* Free Trial Plan */}
          <PricingCard $highlighted={true}>
            <CardHeader className="">
              <RecommendedBadge>
                <Star className="w-4 h-4 mr-1" />
                ¡Nuevo!
              </RecommendedBadge>
              <PlanIcon>
                <TestTube className="w-12 h-12 text-primary dark:text-blue-400" />
              </PlanIcon>
              <PlanTitle className="text-gray-900 dark:text-gray-100">Prueba gratuita</PlanTitle>
              <PlanSubtitle>Prueba todas las funciones por 15 días</PlanSubtitle>
              <PlanPrice>
                <PriceAmount className="text-gray-900 dark:text-gray-100">Gratis</PriceAmount>
                <PricePeriod>por 15 días</PricePeriod>
              </PlanPrice>
            </CardHeader>

            <FeaturesList>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Agenda digital con recordatorios automáticos
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Expedientes médicos digitales
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Hasta 20 pacientes
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Resúmenes automáticos con IA
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Acceso completo por 15 días
              </Feature>
            </FeaturesList>

            <CardFooter>
              <PlanButton 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleFreeTrialClick}
              >
                Empezar prueba gratuita
              </PlanButton>
            </CardFooter>
          </PricingCard>

          {/* Basic Plan */}
          <PricingCard>
            <CardHeader className="">
              <PlanIcon>
                <Briefcase className="w-12 h-12 text-gray-600 dark:text-gray-400" />
              </PlanIcon>
              <PlanTitle className="text-gray-900 dark:text-gray-100">Básico</PlanTitle>
              <PlanSubtitle>Para consultorios pequeños</PlanSubtitle>
              <PlanPrice>
                <PriceAmount className="text-gray-900 dark:text-gray-100">{formatPrice(99.99)}</PriceAmount>
                <PricePeriod>/mes</PricePeriod>
              </PlanPrice>
            </CardHeader>

            <FeaturesList>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Agenda digital con recordatorios automáticos
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Expedientes médicos digitales
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Hasta 100 pacientes
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Resúmenes automáticos con IA
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-green-600" />
                Soporte por email
              </Feature>
            </FeaturesList>

            <CardFooter>
              <PlanButton 
                variant="outline"
                onClick={handleContactClick}
                className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Contáctanos
              </PlanButton>
            </CardFooter>
          </PricingCard>

          {/* Pro Plan */}
          <PricingCard $pro={true}>
            <CardHeader className="">
              <PlanIcon>
                <Stethoscope className="w-12 h-12 text-white" />
              </PlanIcon>
              <PlanTitle>Pro</PlanTitle>
              <PlanSubtitle className="text-white/90">Para consultorios grandes y clínicas</PlanSubtitle>
              <PlanPrice>
                <PriceAmount>{formatPrice(129.99)}</PriceAmount>
                <PricePeriod className="text-white/80">/mes</PricePeriod>
              </PlanPrice>
            </CardHeader>

            <FeaturesList>
              <Feature>
                <Check className="w-4 h-4 text-white" />
                Incluye todo el plan básico + pacientes ilimitados
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-white" />
                Reportes personalizados para análisis de datos
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-white" />
                Plantillas digitales para recetas
              </Feature>
              <Feature>
                <Check className="w-4 h-4 text-white" />
                Soporte prioritario en vivo
              </Feature>
            </FeaturesList>

            <CardFooter>
              <PlanButton 
                variant="outline"
                onClick={handleContactClick}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
              >
                Contáctanos
              </PlanButton>
            </CardFooter>
          </PricingCard>
        </PricingGrid>
      </ContentWrapper>
    </Section>
  )
}

// Styled components
const Section = tw.section`
  relative w-full py-16 px-4
  bg-gradient-to-tr from-[#0589c2] via-[#3abdd4] to-[#93efff]
  dark:from-[#0d1421] dark:via-[#1a2332] dark:to-[#2a3441]
`

const ContentWrapper = tw.div`
  relative w-full max-w-7xl mx-auto
`

const Header = tw.div`
  text-center mb-8
`

const Title = tw.h2`
  text-4xl sm:text-5xl font-bold text-white mb-4
`

const Subtitle = tw.p`
  text-white/90 text-lg max-w-2xl mx-auto
`

const PricingGrid = tw.div`
  grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto md:pb-0 pb-12
`

const PricingCard = tw(Card)<{ $highlighted?: boolean; $pro?: boolean }>`
  relative p-8
  ${({ $highlighted }) => $highlighted 
    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-gradient-to-br dark:from-gray-800/95 dark:to-gray-700/95 border-2 border-yellow-400 shadow-xl overflow-visible' 
    : ''}
  ${({ $pro }) => $pro 
    ? 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white border-sky-300' 
    : 'bg-white/80 dark:bg-gray-900/95'}
  backdrop-blur-sm border border-white/20 dark:border-gray-700/50
  shadow-2xl shadow-black/10 dark:shadow-black/50
  transition-all duration-200 hover:scale-[1.02] hover:shadow-3xl
`

const CardHeader = tw.div`
  text-center
`

const RecommendedBadge = tw.div`
  absolute -top-1 -right-1 z-10
  bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-400 
  text-yellow-900 px-3 py-1 rounded-bl-lg
  text-xs font-semibold flex items-center
  shadow-lg animate-[glow_2s_ease-in-out_infinite]
  before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-300 before:to-amber-300 before:opacity-50 before:blur-sm before:rounded-bl-lg
`

const PlanIcon = tw.div`
  mb-4 flex justify-center
`

const PlanTitle = tw.h3`
  text-2xl font-bold mb-2
`

const PlanSubtitle = tw.p`
  text-sm text-gray-600 dark:text-gray-300 mb-4
`

const PlanPrice = tw.div`
  mb-6
`

const PriceAmount = tw.span`
  text-3xl font-bold
`

const PricePeriod = tw.span`
  text-sm text-gray-600 dark:text-gray-300 ml-1
`

const FeaturesList = tw.ul`
  space-y-3 mb-8
`

const Feature = tw.li`
  flex items-start gap-2 text-sm
`

const CardFooter = tw.div`
  mt-auto
`

const PlanButton = tw(Button)`
  w-full py-3
`
