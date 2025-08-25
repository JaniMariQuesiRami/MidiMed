'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { sendMagicLink, getBaseUrl } from '@/lib/magic-link'
import { signOutUser } from '@/db/session'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import { Mail, Key } from 'lucide-react'
import { signUp } from '@/db/db'
import tw from 'tailwind-styled-components'
import Link from 'next/link'
import { trackEvent } from '@/utils/trackEvent'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

type LoginStep = 'email' | 'sent' | 'password'

type SignupStep = 'form' | 'sent'

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginStep, setLoginStep] = useState<LoginStep>('email')
  const [signupStep, setSignupStep] = useState<SignupStep>('form')

  const handleMagicLinkSend = async () => {
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico')
      return
    }

    setLoading(true)
    try {
      // Check if user or invitation exists
      const { checkUserOrInviteExistsByEmail } = await import('@/db/users')
      const userCheck = await checkUserOrInviteExistsByEmail(email)
      
      if (!userCheck.exists) {
        // User doesn't exist and has no invitation - redirect to signup
        toast.error('No encontramos una cuenta con ese correo. Te redirigiremos al registro.')
        setTimeout(() => {
          window.location.href = `/signup?email=${encodeURIComponent(email)}`
        }, 2000)
        return
      }
      
      // User exists or has invitation - proceed with magic link
      await sendMagicLink(email)
      setLoginStep('sent')
      toast.success('¡Enlace enviado! Revisa tu correo.')
    } catch (err) {
      console.error('Error sending magic link:', err)
      toast.error('Error al enviar el enlace. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordAuth = async () => {
    setLoading(true)
    try {
      // Check if user or invitation exists
      const { checkUserOrInviteExistsByEmail } = await import('@/db/users')
      const userCheck = await checkUserOrInviteExistsByEmail(email)
      
      if (!userCheck.exists) {
        // User doesn't exist and has no invitation - redirect to signup
        toast.error('No encontramos una cuenta con ese correo. Te redirigiremos al registro.')
        setTimeout(() => {
          window.location.href = `/signup?email=${encodeURIComponent(email)}`
        }, 2000)
        return
      }

      // Intentar login normal primero
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (loginError) {
        if (typeof loginError === 'object' && loginError !== null && 'code' in loginError) {
          if (loginError.code === 'auth/user-not-found') {
            const { loginWithInvitation } = await import('@/db/users')
            await loginWithInvitation(email, password)
            const invitedUser = auth.currentUser
            if (invitedUser && !invitedUser.emailVerified) {
              await signOutUser()
              toast.error('Por favor verifica tu correo antes de iniciar sesión.')
              return
            }
            toast.success('¡Bienvenido! Tu cuenta ha sido activada.')
            return
          }

          if (
            loginError.code === 'auth/wrong-password' ||
            loginError.code === 'auth/invalid-credential'
          ) {
            toast.error('Correo o contraseña incorrectos')
            return
          }
        }

        throw loginError
      }

      // Si login normal fue exitoso, verificar correo
      const user = auth.currentUser
      if (user && !user.emailVerified) {
        await signOutUser()
        toast.error('Por favor verifica tu correo antes de iniciar sesión.')
        return
      }

      if (user) {
        const { doc, updateDoc } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        const userRef = doc(db, 'users', user.uid)
        await updateDoc(userRef, { lastLoginAt: new Date().toISOString() })
      }
    } catch (err: unknown) {
      toast.error('Error al autenticar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendLink = async () => {
    setLoading(true)
    try {
      await sendMagicLink(email)
      toast.success('¡Enlace reenviado! Revisa tu correo.')
    } catch (err) {
      console.error('Error resending magic link:', err)
      toast.error('Error al reenviar el enlace. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(credential.user, {
        url: `${getBaseUrl()}/login`,
      })
      toast.success('Correo de verificación reenviado. Revisa tu correo.')
    } catch (err) {
      console.error('Error resending verification email:', err)
      toast.error('Error al reenviar el correo. Intenta nuevamente.')
    } finally {
      try {
        await signOutUser()
      } catch (signOutErr) {
        console.error('Error signing out after resending verification:', signOutErr)
      }
      setLoading(false)
    }
  }

  const handleAuth = async () => {
    setLoading(true)
    try {
      if (mode === 'signup') {
        const result = await signUp({
          email,
          password,
          displayName,
          tenantName,
          phone,
          address,
        })
        trackEvent('Created Account', {
          userId: result.user.uid,
          tenantId: result.tenantId,
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
          setSignupStep('sent')
        }
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
        toast.error('Error al autenticar')
      }
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'

  // Pantalla de confirmación después de enviar magic link
  if (mode === 'login' && loginStep === 'sent') {
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
                <p className="text-lg font-medium">Te hemos enviado un enlace mágico</p>
                <p className="text-sm text-gray-600">
                  Revisa tu correo <strong>{email}</strong> y haz clic en el enlace para completar el acceso.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-500">¿No recibiste el correo?</p>
              <Button
                variant="outline"
                onClick={handleResendLink}
                disabled={loading}
                className="w-full"
              >
                Enviar nuevo enlace
              </Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm text-gray-500">¿Prefieres iniciar sesión con contraseña?</p>
              <Button 
                variant="ghost" 
                onClick={() => setLoginStep('password')}
                disabled={loading}
                className="w-full text-primary hover:text-primary/80 flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Usar contraseña
              </Button>
            </div>
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  if (mode === 'signup' && signupStep === 'sent') {
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
                <p className="text-lg font-medium">Organización creada</p>
                <p className="text-sm text-gray-600">
                  Hemos enviado un correo de verificación a <strong>{email}</strong>. Revisa tu correo para activar tu cuenta.
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
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  // Pantalla de login con contraseña
  if (mode === 'login' && loginStep === 'password') {
    return (
      <Wrapper>
        <Title>MidiMed</Title>
        <StyledCard>
          <CardHeader>
            <CardTitle className="text-xl">Iniciar sesión con contraseña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </FieldGroup>
            <Button 
              onClick={handlePasswordAuth} 
              disabled={loading} 
              className="w-full flex items-center justify-center gap-1"
            >
              {loading ? <LoadingSpinner className="h-4 w-4 border-white border-t-transparent" /> : 'Ingresar'}
            </Button>
            
            <div className="text-center pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={() => setLoginStep('email')}
                disabled={loading}
                className="text-sm text-primary hover:text-primary/80"
              >
                ← Volver al enlace mágico
              </Button>
            </div>

            <div className="text-sm text-center">
              <span>
                ¿Nuevo aquí?{' '}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Crear cuenta
                </Link>
              </span>
            </div>
          </CardContent>
        </StyledCard>
      </Wrapper>
    )
  }

  // Formulario principal (signup o login con magic link)
  return (
    <Wrapper>
      <Title>
        MidiMed
      </Title>
      <StyledCard>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'signup' && (
            <>
              <FieldGroup>
                <Label htmlFor="displayName">Nombre</Label>
                <Input
                  id="displayName"
                  placeholder="Dra. Pérez"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="tenantName">Nombre de la clínica</Label>
                <Input
                  id="tenantName"
                  placeholder="Clínica ACME"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  disabled={loading}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  pattern="^\+\d{1,3}\s?\d{8}$"
                  placeholder="+502 55551234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  placeholder="4a Avenida 15-45, Zona 10, Guatemala"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />
              </FieldGroup>
            </>
          )}
          <FieldGroup>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </FieldGroup>
          
          {mode === 'signup' && (
            <FieldGroup>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </FieldGroup>
          )}

          <Button 
            onClick={mode === 'signup' ? handleAuth : handleMagicLinkSend} 
            disabled={loading} 
            className="w-full flex items-center justify-center gap-1"
          >
            {loading ? (
              // On primary buttons, use a contrasting spinner color
              <LoadingSpinner className="h-4 w-4 border-white border-t-transparent" />
            ) : mode === 'signup' ? (
              'Crear cuenta'
            ) : (
              'Continuar'
            )}
          </Button>

          <div className="text-sm text-center">
            {mode === 'signup' ? (
              <span>
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Ingresar
                </Link>
              </span>
            ) : (
              <span>
                ¿Nuevo aquí?{' '}
                <Link href="/signup" className="text-primary font-medium hover:underline">
                  Crear cuenta
                </Link>
              </span>
            )}
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
  w-full max-w-lg
`

const FieldGroup = tw.div`
  space-y-1
`

const Title = tw.h1`
  text-6xl font-bold mb-6 text-center
  text-white
`;
