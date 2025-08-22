'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, AlertCircle, ArrowRight, X, Copy, Check } from 'lucide-react'
import tw from 'tailwind-styled-components'

interface PaymentConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  email: string
  planName: string
  isProcessing: boolean
}

export default function PaymentConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  email,
  planName,
  isProcessing
}: PaymentConfirmationModalProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setIsCopied(true)
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy email:', err)
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Header>
          <HeaderContent>
            <IconContainer>
              <Mail className="w-6 h-6 text-primary" />
            </IconContainer>
            <div>
              <Title>Confirmar Actualización de Plan</Title>
              <Subtitle>Revisa tu información antes de continuar</Subtitle>
            </div>
          </HeaderContent>
          <CloseButton onClick={onClose} disabled={isProcessing}>
            <X className="w-5 h-5" />
          </CloseButton>
        </Header>

        <Content>
          <PlanInfo>
            <PlanLabel>Plan seleccionado:</PlanLabel>
            <PlanValue>{planName}</PlanValue>
          </PlanInfo>

          <EmailSection>
            <EmailLabel>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              IMPORTANTE: Email de confirmación
            </EmailLabel>
            <EmailContainer>
              <EmailValue>{email}</EmailValue>
              <CopyButton onClick={copyToClipboard} disabled={isProcessing || isCopied}>
                {isCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </CopyButton>
            </EmailContainer>
            <EmailNote>
              Debes usar exactamente este email en el flujo de confirmación de pago.
              Las confirmaciones y facturas se enviarán a esta dirección.
            </EmailNote>
          </EmailSection>
        </Content>

        <Footer>
          <TextButton onClick={onClose} disabled={isProcessing}>
            Cancelar
          </TextButton>
          <PrimaryButton onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                Continuar al Pago
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </PrimaryButton>
        </Footer>
      </ModalContainer>
    </Overlay>
  )
}

// Styled Components
const Overlay = tw.div`
  fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
  flex items-center justify-center p-4
  animate-in fade-in-0 duration-200
`

const ModalContainer = tw.div`
  bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700
  w-full max-w-md mx-auto
  animate-in slide-in-from-bottom-4 duration-300
`

const Header = tw.div`
  flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700
`

const HeaderContent = tw.div`
  flex items-center gap-4
`

const IconContainer = tw.div`
  w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center
`

const Title = tw.h2`
  text-lg font-semibold text-gray-900 dark:text-white
`

const Subtitle = tw.p`
  text-sm text-gray-500 dark:text-gray-400
`

const CloseButton = tw.button`
  w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
  flex items-center justify-center text-gray-500 dark:text-gray-400
  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
`

const Content = tw.div`
  p-6 space-y-6
`

const PlanInfo = tw.div`
  p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800
`

const PlanLabel = tw.p`
  text-sm font-medium text-blue-800 dark:text-blue-300 mb-1
`

const PlanValue = tw.p`
  text-lg font-semibold text-blue-900 dark:text-blue-100
`

const EmailSection = tw.div`
  space-y-3
`

const EmailLabel = tw.div`
  flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300
`

const EmailContainer = tw.div`
  flex items-center justify-between gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800
`

const EmailValue = tw.p`
  font-mono text-sm text-amber-900 dark:text-amber-100 break-all
`

const EmailNote = tw.p`
  text-xs text-gray-600 dark:text-gray-400 leading-relaxed
`

const Footer = tw.div`
  flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700
`

const TextButton = tw(Button)`
  px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
  hover:bg-transparent hover:underline disabled:opacity-50 disabled:cursor-not-allowed
  border-none bg-transparent shadow-none
`

const CopyButton = tw.button`
  p-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200
  hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md transition-colors
  flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed
`

const PrimaryButton = tw(Button)`
  px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground
  disabled:opacity-50 disabled:cursor-not-allowed flex items-center
`
