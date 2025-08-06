'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isMagicLinkSignIn, completeMagicLinkSignIn } from '@/lib/magic-link'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/LoadingSpinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, AlertCircle } from 'lucide-react'
import tw from 'tailwind-styled-components'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { createUserFromInvite } from '@/db/users'

export default function FinishSignInPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'expired' | 'invalid' | 'general'>('general')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleMagicLinkSignIn = async () => {
      try {
        if (!isMagicLinkSignIn()) {
          setError('Enlace de acceso inválido')
          setErrorType('invalid')
          return
        }

        await completeMagicLinkSignIn()

        const user = auth.currentUser
        if (!user) {
          throw new Error('No user after sign in')
        }

        // Verificar si el email está verificado (funcionalidad del HEAD)
        if (!user.emailVerified) {
          await signOut(auth)
          setError('Debes verificar tu correo antes de iniciar sesión.')
          setErrorType('general')
          toast.error('Correo no verificado')
          return
        }

        // Verificar si el usuario ya existe o crear desde invitación (funcionalidad del development)
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          // Usuario existente, actualizar último login
          await updateDoc(userRef, { lastLoginAt: new Date().toISOString() })
        } else {
          // Usuario nuevo, intentar crear desde invitación
          const created = await createUserFromInvite(user.email ?? '', user.uid)
          if (!created) {
            setError('No se encontró una invitación válida para este correo.')
            setErrorType('invalid')
            await signOut(auth)
            toast.error('No se encontró una invitación válida para este correo.')
            return
          }
        }

        toast.success('¡Bienvenido! Has iniciado sesión exitosamente.')

        // Redirigir al dashboard o página principal
        router.push('/dashboard')
      } catch (err) {
        console.error('Error completing magic link sign in:', err)
        
        // Detectar tipo específico de error
        if (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          err.code === 'auth/invalid-action-code'
        ) {
          setError('Este enlace ha expirado o ya fue utilizado. Los enlaces mágicos solo son válidos por una hora.')
          setErrorType('expired')
        } else if (
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          err.code === 'auth/expired-action-code'
        ) {
          setError('Este enlace ha expirado. Los enlaces mágicos solo son válidos por una hora.')
          setErrorType('expired')
        } else {
          setError('Error al completar el acceso. Intenta nuevamente.')
          setErrorType('general')
        }
        
        toast.error('Error al completar el acceso')
      } finally {
        setLoading(false)
      }
    }

    handleMagicLinkSignIn()
  }, [router, mounted])

  // Mostrar loading mientras se monta el componente para evitar hydration issues
  if (!mounted) {
    return (
      <Wrapper>
        <StyledCard>
          <CardContent className="text-center py-8">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-lg">Cargando...</p>
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  if (loading) {
    return (
      <Wrapper>
        <StyledCard>
          <CardContent className="text-center py-8">
            <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
            <p className="text-lg">Completando acceso...</p>
            <p className="text-sm text-gray-600 mt-2">Por favor espera un momento</p>
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  if (error) {
    return (
      <Wrapper>
        <StyledCard>
          <CardHeader>
            <CardTitle className="text-xl text-red-600">
              {errorType === 'expired' ? 'Enlace expirado' : 'Error de acceso'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              {errorType === 'expired' ? (
                <Clock className="h-12 w-12 text-orange-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
            </div>
            <p className="text-gray-700">{error}</p>
            
            {errorType === 'expired' ? (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Solicita un nuevo enlace mágico para continuar
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 font-medium"
                >
                  Solicitar nuevo enlace
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="text-primary hover:underline font-medium"
              >
                Volver al inicio de sesión
              </button>
            )}
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  return null
}

const Wrapper = tw.div`
  flex flex-col items-center justify-center min-h-[100dvh] px-4 w-full
`

const StyledCard = tw(Card)`
  w-full max-w-md
`
