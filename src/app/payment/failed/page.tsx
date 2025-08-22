'use client'

import { useEffect, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/contexts/UserContext'
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/utils/trackEvent'
import tw from 'tailwind-styled-components'

export default function PaymentFailedPage() {
  const router = useRouter()
  const { user, tenant } = useContext(UserContext)

  useEffect(() => {
    if (user && tenant) {
      trackEvent('Payment Failed Page Visited', {
        userId: user.uid,
        tenantId: tenant.tenantId,
      })
    }
  }, [user, tenant])

  const handleRetryPayment = () => {
    trackEvent('Payment Failed - Retry Payment', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
    router.push('/settings?tab=planes')
  }

  const handleGoToDashboard = () => {
    trackEvent('Payment Failed - Go to Settings', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
    router.push('/dashboard')
  }

  return (
    <PageContainer>
      <ContentCard>
        {/* Error Icon */}
        <ErrorIconContainer>
          <ErrorIcon>
            <XCircle className="w-20 h-20 text-white" />
          </ErrorIcon>
          <AlertIcon>
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </AlertIcon>
        </ErrorIconContainer>

        {/* Main Content */}
        <ContentSection>
          <MainTitle>No se pudo procesar el pago</MainTitle>
          <MainMessage>
            Hubo un problema al procesar tu pago. No te preocupes, estos inconvenientes son temporales y se pueden solucionar fácilmente.
          </MainMessage>

          {/* Error Information */}
          <ErrorSection>
            <ErrorTitle>Posibles causas:</ErrorTitle>
            <ErrorList>
              <ErrorItem>• Fondos insuficientes en tu cuenta</ErrorItem>
              <ErrorItem>• Problemas de conexión temporales</ErrorItem>
              <ErrorItem>• Información de tarjeta incorrecta</ErrorItem>
              <ErrorItem>• Límites de transacción alcanzados</ErrorItem>
            </ErrorList>
          </ErrorSection>

          {/* Action Buttons */}
          <ActionSection>
            <PrimaryButton onClick={handleRetryPayment}>
              <RefreshCw className="w-5 h-5 mr-2" />
              Reintentar Pago
            </PrimaryButton>
            <SecondaryButton onClick={handleGoToDashboard}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ir al Dashboard
            </SecondaryButton>
          </ActionSection>

          {/* Support Message */}
          <SupportSection>
            <SupportText>
              Si el problema persiste, contacta a nuestro soporte técnico para recibir asistencia.
            </SupportText>
          </SupportSection>
        </ContentSection>
      </ContentCard>
    </PageContainer>
  )
}

// Styled Components
const PageContainer = tw.div`
  min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 
  dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
  flex items-center justify-center p-4
`

const ContentCard = tw.div`
  bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700
  p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden
`

const ErrorIconContainer = tw.div`
  relative mb-8
`

const ErrorIcon = tw.div`
  w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full 
  flex items-center justify-center mx-auto shadow-lg
  animate-pulse
`

const AlertIcon = tw.div`
  absolute -top-2 -right-2 animate-bounce
`

const ContentSection = tw.div`
  space-y-6
`

const MainTitle = tw.h1`
  text-3xl md:text-4xl font-bold text-gray-900 dark:text-white
  bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent
`

const MainMessage = tw.p`
  text-lg text-gray-600 dark:text-gray-300 leading-relaxed
`

const ErrorSection = tw.div`
  bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800
`

const ErrorTitle = tw.h3`
  text-sm font-semibold text-red-800 dark:text-red-300 mb-3
`

const ErrorList = tw.div`
  space-y-1 text-left
`

const ErrorItem = tw.p`
  text-sm text-red-700 dark:text-red-300
`

const ActionSection = tw.div`
  space-y-3 pt-4
`

const PrimaryButton = tw(Button)`
  w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
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

const SupportSection = tw.div`
  pt-4 border-t border-gray-200 dark:border-gray-700
`

const SupportText = tw.p`
  text-sm text-gray-500 dark:text-gray-400
`
