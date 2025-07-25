'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import tw from 'tailwind-styled-components'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { createLead } from '@/db/leads'
import { toast } from 'sonner'
import { Send, Calendar, CheckCircle, Loader2 } from 'lucide-react'

type ContactFormData = {
  name: string
  email: string
  message?: string
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      await createLead(data)
      setIsSubmitted(true)
      toast.success('¡Mensaje enviado exitosamente!')
      reset()
    } catch (error) {
      toast.error('Error al enviar el mensaje. Por favor intenta de nuevo.')
      console.error('Error submitting contact form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <FormCard>
        <SuccessContent>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <SuccessTitle>¡Mensaje enviado!</SuccessTitle>
          <SuccessMessage>
            Gracias por contactarnos. Nos pondremos en contacto contigo muy pronto.
          </SuccessMessage>
          <CalendlySection>
            <CalendlyTitle>¿Quieres coordinar una llamada de inmediato?</CalendlyTitle>
            <CalendlyButton
              href="https://calendly.com/andresequez/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Programar llamada
            </CalendlyButton>
          </CalendlySection>
          <ResetButton 
            variant="ghost" 
            onClick={() => setIsSubmitted(false)}
          >
            Enviar otro mensaje
          </ResetButton>
        </SuccessContent>
      </FormCard>
    )
  }

  return (
    <FormCard>
      <FormContent>
        <FormHeader>
          <FormTitle>Contáctanos</FormTitle>
          <FormSubtitle>
            Nos encantaría conocer más sobre tu práctica médica y cómo podemos ayudarte.
          </FormSubtitle>
        </FormHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField>
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre completo"
              {...register('name', { 
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'El nombre debe tener al menos 2 caracteres' }
              })}
              className={errors.name ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register('email', { 
                required: 'El correo electrónico es obligatorio',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Correo electrónico inválido'
                }
              })}
              className={errors.email ? 'border-red-500 focus:border-red-500' : ''}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </FormField>

          <FormField>
            <Label htmlFor="message">Mensaje (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos sobre tu práctica, necesidades específicas, o cualquier pregunta que tengas..."
              rows={4}
              {...register('message')}
            />
          </FormField>

          <SubmitButton 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar mensaje
              </>
            )}
          </SubmitButton>
        </form>

        <CalendlySection>
          <CalendlyTitle>¿Prefieres coordinar una llamada directamente?</CalendlyTitle>
          <CalendlyButton
            href="https://calendly.com/andresequez/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Programar llamada
          </CalendlyButton>
        </CalendlySection>
      </FormContent>
    </FormCard>
  )
}

// Styled Components
const FormCard = tw(Card)`
  w-full max-w-lg mx-auto
  bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
  border border-white/20 dark:border-gray-700/50
  shadow-2xl shadow-black/10 dark:shadow-black/50
  p-8
`

const FormContent = tw.div`
  space-y-6
`

const FormHeader = tw.div`
  text-center space-y-2
`

const FormTitle = tw.h2`
  text-2xl font-bold text-gray-900 dark:text-white
`

const FormSubtitle = tw.p`
  text-gray-600 dark:text-gray-300 text-sm
`

const FormField = tw.div`
  space-y-2
`

const ErrorMessage = tw.p`
  text-red-500 text-xs mt-1
`

const SubmitButton = tw(Button)`
  bg-primary hover:bg-primary/90 
  text-primary-foreground
  transition-colors
`

const SuccessContent = tw.div`
  text-center space-y-4
`

const SuccessTitle = tw.h2`
  text-2xl font-bold text-gray-900 dark:text-white
`

const SuccessMessage = tw.p`
  text-gray-600 dark:text-gray-300
`

const CalendlySection = tw.div`
  mt-8 pt-6 border-t border-gray-200 dark:border-gray-700
  text-center space-y-3
`

const CalendlyTitle = tw.p`
  text-sm text-gray-600 dark:text-gray-300 font-medium
`

const CalendlyButton = tw.a`
  inline-flex items-center justify-center
  px-4 py-2 rounded-md
  bg-blue-600 hover:bg-blue-700 
  text-white text-sm font-medium
  transition-colors cursor-pointer
  no-underline
`

const ResetButton = tw(Button)`
  mt-4
`
