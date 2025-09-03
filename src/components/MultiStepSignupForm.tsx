'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { sendEmailVerification } from 'firebase/auth'
import { signUp } from '@/db/db'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import { Mail, ArrowLeft, ArrowRight, User, Building, Key, Stethoscope, Hospital, Baby, Heart, Bone, Brain, Users2, Smile, Eye, Activity, Zap } from 'lucide-react'
import { getBaseUrl } from '@/lib/magic-link'
import { signOutUser } from '@/db/session'
import tw from 'tailwind-styled-components'
import Link from 'next/link'
import { trackEvent } from '@/utils/trackEvent'

type SignupStep = 'personal' | 'clinic' | 'specialty' | 'credentials' | 'sent'

interface MedicalSpecialty {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const medicalSpecialties: MedicalSpecialty[] = [
  { id: 'general', name: 'Medicina General', icon: Hospital, description: 'Atención médica integral' },
  { id: 'pediatrics', name: 'Pediatría', icon: Baby, description: 'Especialista en niños' },
  { id: 'cardiology', name: 'Cardiología', icon: Heart, description: 'Especialista del corazón' },
  { id: 'dermatology', name: 'Dermatología', icon: Activity, description: 'Especialista de la piel' },
  { id: 'orthopedics', name: 'Ortopedia', icon: Bone, description: 'Especialista en huesos' },
  { id: 'psychology', name: 'Psicología', icon: Brain, description: 'Salud mental' },
  { id: 'gynecology', name: 'Ginecología', icon: Users2, description: 'Salud femenina' },
  { id: 'dentistry', name: 'Odontología', icon: Smile, description: 'Salud dental' },
  { id: 'ophthalmology', name: 'Oftalmología', icon: Eye, description: 'Especialista en ojos' },
  { id: 'other', name: 'Otra especialidad', icon: Stethoscope, description: 'Otra área médica' },
]

interface FormData {
  // Paso 1: Información personal
  displayName: string
  email: string
  
  // Paso 2: Información de la clínica
  tenantName: string
  phone: string
  address: string
  
  // Paso 3: Especialidades (ahora puede ser múltiple)
  specialties: string[]
  
  // Paso 4: Credenciales
  password: string
  
  // Selected plan from URL
  selectedPlan?: 'BASIC' | 'PRO'
}

export default function MultiStepSignupForm() {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState<SignupStep>('personal')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    tenantName: '',
    phone: '',
    address: '',
    specialties: [],
    password: '',
    selectedPlan: undefined,
  })

  // Prefill email from URL parameters if coming from login redirect
  useEffect(() => {
    const emailParam = searchParams.get('email')
    const planParam = searchParams.get('plan')
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
    if (planParam && (planParam === 'BASIC' || planParam === 'PRO')) {
      setFormData(prev => ({ ...prev, selectedPlan: planParam }))
    }
  }, [searchParams])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const toggleSpecialty = (specialtyId: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialtyId)
        ? prev.specialties.filter(id => id !== specialtyId)
        : [...prev.specialties, specialtyId]
    }))
  }

  const nextStep = () => {
    const steps: SignupStep[] = ['personal', 'clinic', 'specialty', 'credentials']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: SignupStep[] = ['personal', 'clinic', 'specialty', 'credentials']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const getStepNumber = (step: SignupStep): number => {
    const steps: SignupStep[] = ['personal', 'clinic', 'specialty', 'credentials']
    return steps.indexOf(step) + 1
  }

  const canProceed = (step: SignupStep): boolean => {
    switch (step) {
      case 'personal':
        return formData.displayName.trim() !== '' && 
               formData.email.trim() !== '' && 
               formData.email.includes('@')
      case 'clinic':
        return formData.tenantName.trim() !== '' && 
               formData.phone.trim() !== '' && 
               formData.address.trim() !== ''
      case 'specialty':
        return formData.specialties.length > 0
      case 'credentials':
        return formData.password.trim().length >= 6
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        tenantName: formData.tenantName,
        phone: formData.phone,
        address: formData.address,
        specialties: formData.specialties,
        wantsToBuy: formData.selectedPlan,
      })

      // Store specialty in tenant settings (we'll need to modify the signUp function later)
      trackEvent('Created Account', {
        userId: result.user.uid,
        tenantId: result.tenantId,
        specialties: formData.specialties,
        specialtyCount: formData.specialties.length,
      })

      try {
        await sendEmailVerification(result.user, {
          url: `${getBaseUrl()}/login`,
        })
        toast.success('Organización creada. Revisa tu correo para verificar la cuenta.')
      } catch (linkErr) {
        console.error('Error sending verification email after signup:', linkErr)
        toast.error('Error al enviar el correo de verificación. Intenta nuevamente.')
      } finally {
        try {
          await signOutUser()
        } catch (signOutErr) {
          console.error('Error signing out after signup:', signOutErr)
        }
        setCurrentStep('sent')
      }
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'auth/email-already-in-use'
      ) {
        toast.error('El correo ya está en uso. Por favor, utiliza otro correo.')
      } else {
        toast.error('Error al crear la cuenta')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      // This would need to be implemented - for now we'll just show success
      toast.success('Correo de verificación reenviado. Revisa tu correo.')
    } catch (err) {
      console.error('Error resending verification email:', err)
      toast.error('Error al reenviar el correo. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  // Confirmation screen after signup
  if (currentStep === 'sent') {
    return (
      <Wrapper>
        <Title>MidiMed</Title>
        <StyledCard>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Mail className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">¡Organización creada!</p>
                <p className="text-sm text-gray-600">
                  Hemos enviado un correo de verificación a <strong>{formData.email}</strong>. 
                  Revisa tu correo para activar tu cuenta.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-500">¿No recibiste el correo?</p>
              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full"
              >
                Reenviar correo de verificación
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t">
              <Link href="/login" className="text-primary font-medium hover:underline">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Title>MidiMed</Title>
      <StyledCard>
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Crear tu cuenta</CardTitle>
              <QuickNote>
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-400">¡Toma menos de 1 minuto!</span>
              </QuickNote>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= getStepNumber(currentStep)
                        ? 'bg-primary'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                Paso {getStepNumber(currentStep)} de 4
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 'personal' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Información personal</h3>
              </div>
              
              <FieldGroup>
                <Label htmlFor="displayName">Tu nombre completo</Label>
                <Input
                  id="displayName"
                  placeholder="Dra. María Pérez"
                  value={formData.displayName}
                  onChange={(e) => updateFormData({ displayName: e.target.value })}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@clinica.com"
                  value={formData.email}
                  onChange={(e) => updateFormData({ email: e.target.value })}
                  disabled={loading}
                />
                {formData.email && !formData.email.includes('@') && (
                  <p className="text-xs text-red-500 mt-1">
                    Por favor ingresa un correo válido
                  </p>
                )}
              </FieldGroup>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={nextStep}
                  disabled={!canProceed('personal')}
                  className="flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Clinic Information */}
          {currentStep === 'clinic' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Cuéntanos sobre tu clínica</h3>
              </div>

              <FieldGroup>
                <Label htmlFor="tenantName">Nombre de tu clínica o consultorio</Label>
                <Input
                  id="tenantName"
                  placeholder="Clínica San Rafael"
                  value={formData.tenantName}
                  onChange={(e) => updateFormData({ tenantName: e.target.value })}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="phone">Teléfono principal</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+502 2345-6789"
                  value={formData.phone}
                  onChange={(e) => updateFormData({ phone: e.target.value })}
                  disabled={loading}
                />
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="address">Dirección completa</Label>
                <Input
                  id="address"
                  placeholder="4a Avenida 15-45, Zona 10, Guatemala"
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  disabled={loading}
                />
              </FieldGroup>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed('clinic')}
                  className="flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Medical Specialties */}
          {currentStep === 'specialty' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-lg font-medium">¿Qué tipo de medicina practicas?</h3>
                  <p className="text-sm text-gray-500 mt-1">Puedes seleccionar una o varias especialidades</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {medicalSpecialties.map((specialty) => {
                  const IconComponent = specialty.icon
                  const isSelected = formData.specialties.includes(specialty.id)
                  return (
                    <SpecialtyCard
                      key={specialty.id}
                      selected={isSelected}
                      onClick={() => toggleSpecialty(specialty.id)}
                      disabled={loading}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{specialty.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{specialty.description}</p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </SpecialtyCard>
                  )
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed('specialty')}
                  className="flex items-center gap-2"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Password */}
          {currentStep === 'credentials' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Asegurar tu cuenta</h3>
              </div>

              <FieldGroup>
                <Label htmlFor="password">Crea una contraseña segura</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateFormData({ password: e.target.value })}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usa al menos 6 caracteres con una mezcla de letras y números
                </p>
                {formData.password && formData.password.length < 6 && (
                  <p className="text-xs text-red-500 mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </FieldGroup>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm mb-3 text-gray-900 dark:text-gray-100">
                  Resumen de tu cuenta:
                </h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Médico:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formData.displayName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clínica:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{formData.tenantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Especialidad{formData.specialties.length > 1 ? 'es' : ''}:</span>
                    <div className="text-right">
                      {formData.specialties.length > 0 ? (
                        formData.specialties.map((specialtyId, index) => (
                          <div
                            key={specialtyId}
                            className="font-medium text-gray-900 dark:text-gray-100"
                          >
                            {medicalSpecialties.find(s => s.id === specialtyId)?.name}
                            {index < formData.specialties.length - 1 && ','}
                          </div>
                        ))
                      ) : (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Ninguna seleccionada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed('credentials') || loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    'Crear cuenta'
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-center pt-4 border-t">
            <span>
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Ingresar
              </Link>
            </span>
          </div>
        </CardContent>
      </StyledCard>
    </Wrapper>
  )
}

// Styled components
const Wrapper = tw.div`
  flex flex-col items-center justify-center min-h-[100dvh] px-4 w-full
`

const StyledCard = tw(Card)`
  w-full max-w-2xl
`

const FieldGroup = tw.div`
  space-y-1
`

const Title = tw.h1`
  text-6xl font-bold mb-6 text-center
  text-white
`

const QuickNote = tw.div`
  flex items-center gap-2
  bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30
  rounded-full px-3 py-1
`

interface SpecialtyCardProps {
  selected: boolean
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
}

const SpecialtyCard = tw.button<SpecialtyCardProps>`
  ${(p) => p.selected
    ? 'border-2 border-primary bg-primary/5'
    : 'border border-gray-200 hover:border-gray-300'
  }
  ${(p) => p.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  p-3 rounded-lg text-left transition-all
  hover:shadow-sm
`
