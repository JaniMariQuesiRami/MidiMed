'use client'

import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/contexts/UserContext'
import { CheckCircle, ArrowRight, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/utils/trackEvent'
import tw from 'tailwind-styled-components'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const { user, tenant } = useContext(UserContext)

  useEffect(() => {
    if (user && tenant) {
      trackEvent('Payment Success Page Visited', {
        userId: user.uid,
        tenantId: tenant.tenantId,
      })
    }
  }, [user, tenant])

  const handleGoToDashboard = () => {
    trackEvent('Payment Success - Go to Dashboard', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
    router.push('/dashboard')
  }

  return (
    <PageContainer>
      <ContentCard>
        {/* Success Icon */}
        <SuccessIconContainer>
          <SuccessIcon>
            <CheckCircle className="w-20 h-20 text-white" />
          </SuccessIcon>
          <SparklesIcon1>
            <Sparkles className="w-6 h-6" style={{color: '#3abdd4'}} />
          </SparklesIcon1>
          <SparklesIcon2>
            <Sparkles className="w-4 h-4" style={{color: '#208697'}} />
          </SparklesIcon2>
        </SuccessIconContainer>

        {/* Main Content */}
        <ContentSection>
          <MainTitle>¡Pago Exitoso!</MainTitle>
          <MainMessage>
            Tu pago se ha procesado correctamente y tu suscripción está activa.
          </MainMessage>

          {/* Additional Information */}
          <InfoSection>
            <InfoItem>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <InfoText>Tu suscripción ha sido activada</InfoText>
            </InfoItem>
            <InfoItem>
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
              <InfoText>Recibirás un email de confirmación en los próximos minutos</InfoText>
            </InfoItem>
          </InfoSection>

          {/* Action Button */}
          <ActionSection>
            <PrimaryButton onClick={handleGoToDashboard}>
              Ir al Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </PrimaryButton>
          </ActionSection>

          {/* Footer Message */}
          <FooterMessage>
            ¡Gracias por confiar en MidiMed para tu consultorio!
          </FooterMessage>
        </ContentSection>
      </ContentCard>
    </PageContainer>
  )
}

// Styled Components
const PageContainer = tw.div`
  min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 
  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
  flex items-center justify-center p-4
`

const ContentCard = tw.div`
  bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700
  p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden
`

const SuccessIconContainer = tw.div`
  relative mb-8
`

const SuccessIcon = tw.div`
  w-24 h-24 bg-gradient-to-br from-[#3abdd4] to-[#208697] rounded-full 
  flex items-center justify-center mx-auto shadow-lg
  animate-[bounce_1s_ease-in-out_3]
`

const SparklesIcon1 = tw.div`
  absolute -top-2 -right-2 animate-[spin_3s_linear_infinite]
`

const SparklesIcon2 = tw.div`
  absolute -bottom-1 -left-2 animate-[spin_4s_linear_infinite_reverse]
`

const ContentSection = tw.div`
  space-y-6
`

const MainTitle = tw.h1`
  text-3xl md:text-4xl font-bold text-gray-900 dark:text-white
  bg-gradient-to-r from-[#3abdd4] to-[#208697] bg-clip-text text-transparent
`

const MainMessage = tw.p`
  text-lg text-gray-600 dark:text-gray-300 leading-relaxed
`

const InfoSection = tw.div`
  space-y-4 py-6
`

const InfoItem = tw.div`
  flex items-start gap-3 text-left bg-green-50 dark:bg-green-900/20 
  p-3 rounded-lg border border-green-200 dark:border-green-800
`

const InfoText = tw.p`
  text-sm text-gray-700 dark:text-gray-300 font-medium
`

const ActionSection = tw.div`
  pt-4
`

const PrimaryButton = tw(Button)`
  w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
  text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl
  transition-all duration-200 transform hover:scale-105
  flex items-center justify-center
`

const FooterMessage = tw.p`
  text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700
`
