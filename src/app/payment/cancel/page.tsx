'use client'

import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/contexts/UserContext'
import { Pause, ArrowLeft, RotateCcw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/utils/trackEvent'
import tw from 'tailwind-styled-components'

export default function PaymentCancelledPage() {
  const router = useRouter()
  const { user, tenant } = useContext(UserContext)

  useEffect(() => {
    if (user && tenant) {
      trackEvent('Payment Cancelled Page Visited', {
        userId: user.uid,
        tenantId: tenant.tenantId,
      })
    }
  }, [user, tenant])

  const handleRetryPayment = () => {
    trackEvent('Payment Cancelled - Retry Payment', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
    router.push('/settings?tab=planes')
  }

  const handleGoToSettings = () => {
    trackEvent('Payment Cancelled - Go to Settings', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
    router.push('/settings')
  }

  return (
    <PageContainer>
      <ContentCard>
        {/* Cancelled Icon */}
        <CancelledIconContainer>
          <CancelledIcon>
            <Pause className="w-20 h-20 text-white" />
          </CancelledIcon>
          <InfoIcon>
            <Info className="w-6 h-6 text-yellow-400" />
          </InfoIcon>
        </CancelledIconContainer>

        {/* Main Content */}
        <ContentSection>
          <MainTitle>Pago cancelado</MainTitle>
          <MainMessage>
            Has cancelado el proceso de pago. Tu suscripción actual permanece sin cambios.
          </MainMessage>

          {/* Information Section */}
          <InfoSection>
            <InfoTitle>¿Qué significa esto?</InfoTitle>
            <InfoList>
              <InfoItem>• No se realizó ningún cobro a tu cuenta</InfoItem>
              <InfoItem>• Tu plan actual sigue activo</InfoItem>
              <InfoItem>• Puedes reintentar el pago cuando desees</InfoItem>
              <InfoItem>• No afecta tu acceso al sistema</InfoItem>
            </InfoList>
          </InfoSection>

          {/* Action Buttons */}
          <ActionSection>
            <PrimaryButton onClick={handleRetryPayment}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Completar Pago
            </PrimaryButton>
            <SecondaryButton onClick={handleGoToSettings}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a Configuración
            </SecondaryButton>
          </ActionSection>

          {/* Footer Message */}
          <FooterMessage>
            Puedes cambiar de plan en cualquier momento desde la configuración.
          </FooterMessage>
        </ContentSection>
      </ContentCard>
    </PageContainer>
  )
}

// Styled Components
const PageContainer = tw.div`
  min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 
  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
  flex items-center justify-center p-4
`

const ContentCard = tw.div`
  bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700
  p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden
`

const CancelledIconContainer = tw.div`
  relative mb-8
`

const CancelledIcon = tw.div`
  w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full 
  flex items-center justify-center mx-auto shadow-lg
  animate-pulse
`

const InfoIcon = tw.div`
  absolute -top-2 -right-2 animate-bounce
`

const ContentSection = tw.div`
  space-y-6
`

const MainTitle = tw.h1`
  text-3xl md:text-4xl font-bold text-gray-900 dark:text-white
  bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent
`

const MainMessage = tw.p`
  text-lg text-gray-600 dark:text-gray-300 leading-relaxed
`

const InfoSection = tw.div`
  bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800
`

const InfoTitle = tw.h3`
  text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-3
`

const InfoList = tw.div`
  space-y-1 text-left
`

const InfoItem = tw.p`
  text-sm text-yellow-700 dark:text-yellow-300
`

const ActionSection = tw.div`
  space-y-3 pt-4
`

const PrimaryButton = tw(Button)`
  w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600
  text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl
  transition-all duration-200 transform hover:scale-105
  flex items-center justify-center
`

const SecondaryButton = tw(Button)`
  w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
  text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600
  font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg
  transition-all duration-200
  flex items-center justify-center
`

const FooterMessage = tw.p`
  text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700
`
