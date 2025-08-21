'use client'

import { useContext, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UserContext } from '@/contexts/UserContext'
import { createPlanUpgradeRequest } from '@/db/billing'
import { toast } from 'sonner'
import { getTranslatedPlanName } from '@/utils/planTranslations'
import { TrendingUp, Users, Phone, Mail, CheckCircle2 } from 'lucide-react'
import tw from 'tailwind-styled-components'

export default function ContactUsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, tenant } = useContext(UserContext)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const currentPlan = tenant?.billing?.plan || 'TRIAL'

  const submit = async () => {
    if (!user || !tenant) return
    try {
      setSaving(true)
      await createPlanUpgradeRequest({
        tenantId: tenant.tenantId,
        userId: user.uid,
        currentPlan: tenant.billing?.plan || 'TRIAL',
        currentStatus: tenant.billing?.status || 'TRIAL_ACTIVE',
        message,
      })
      toast.success('¡Solicitud enviada! Nuestro equipo de ventas te contactará pronto.')
      setSubmitted(true)
      setMessage('')
    } catch {
      toast.error('No se pudo enviar la solicitud. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSubmitted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        {!submitted ? (
          <>
            <DialogHeader>
              <ModalHeader>
                <UpgradeIcon>
                  <TrendingUp size={24} />
                </UpgradeIcon>
                <div>
                  <DialogTitle className="text-xl">Mejorar Plan</DialogTitle>
                  <ModalSubtitle>
                    Solicitar actualización desde {getTranslatedPlanName(currentPlan)}
                  </ModalSubtitle>
                </div>
              </ModalHeader>
            </DialogHeader>

            <ModalContent>
              <ProcessSection>
                <ProcessTitle>¿Cómo funciona?</ProcessTitle>
                <ProcessSteps>
                  <ProcessStep>
                    <StepIcon>1</StepIcon>
                    <StepText>Envías tu solicitud con tus necesidades específicas</StepText>
                  </ProcessStep>
                  <ProcessStep>
                    <StepIcon>2</StepIcon>
                    <StepText>Nuestro equipo de ventas analiza tu caso</StepText>
                  </ProcessStep>
                  <ProcessStep>
                    <StepIcon>3</StepIcon>
                    <StepText>Te contactamos para ofrecerte la mejor solución</StepText>
                  </ProcessStep>
                </ProcessSteps>
              </ProcessSection>

              <FormSection>
                <FormLabel>Cuéntanos sobre tus necesidades (opcional)</FormLabel>
                <Textarea
                  placeholder="Ej: Necesito más usuarios, más almacenamiento, funciones específicas..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-24"
                />
              </FormSection>

              <ContactInfo>
                <ContactInfoTitle>Nuestro equipo de ventas</ContactInfoTitle>
                <ContactDetails>
                  <ContactItem>
                    <Phone size={16} />
                    <span>Te llamaremos en 24-48 horas</span>
                  </ContactItem>
                  <ContactItem>
                    <Mail size={16} />
                    <span>También recibirás un email de confirmación</span>
                  </ContactItem>
                </ContactDetails>
              </ContactInfo>
            </ModalContent>

            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={handleClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={saving} className="min-w-32">
                {saving ? (
                  <>
                    <LoadingSpinner />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Users size={16} />
                    Contactar Ventas
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <SuccessView>
            <SuccessIcon>
              <CheckCircle2 size={48} />
            </SuccessIcon>
            <SuccessTitle>¡Solicitud Enviada!</SuccessTitle>
            <SuccessMessage>
              Hemos recibido tu solicitud de mejora de plan. Nuestro equipo de ventas 
              se pondrá en contacto contigo en las próximas 24-48 horas para ofrecerte 
              la mejor solución para tus necesidades.
            </SuccessMessage>
            <Button onClick={handleClose} className="w-full mt-4">
              Cerrar
            </Button>
          </SuccessView>
        )}
      </DialogContent>
    </Dialog>
  )
}

const ModalHeader = tw.div`flex items-center gap-4`
const UpgradeIcon = tw.div`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary`
const ModalSubtitle = tw.p`text-sm text-muted-foreground mt-1`

const ModalContent = tw.div`space-y-6`

const ProcessSection = tw.div`space-y-3`
const ProcessTitle = tw.h3`text-sm font-semibold text-foreground`
const ProcessSteps = tw.div`space-y-2`
const ProcessStep = tw.div`flex items-start gap-3`
const StepIcon = tw.div`w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`
const StepText = tw.p`text-sm text-muted-foreground`

const FormSection = tw.div`space-y-2`
const FormLabel = tw.label`text-sm font-medium text-foreground`

const ContactInfo = tw.div`bg-muted/50 rounded-lg p-4 space-y-3`
const ContactInfoTitle = tw.h4`text-sm font-semibold text-foreground`
const ContactDetails = tw.div`space-y-2`
const ContactItem = tw.div`flex items-center gap-2 text-sm text-muted-foreground`

const SuccessView = tw.div`text-center space-y-4 py-4`
const SuccessIcon = tw.div`w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto`
const SuccessTitle = tw.h3`text-lg font-semibold text-foreground`
const SuccessMessage = tw.p`text-sm text-muted-foreground leading-relaxed`

const LoadingSpinner = tw.div`w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin`
