'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import { signUp } from '@/db/db'
import tw from 'tailwind-styled-components'
import Link from 'next/link'

type AuthFormProps = {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp({ email, password, displayName, tenantName, phone, address })
        toast.success('Cuenta creada exitosamente')
      } else {
        // Intentar login normal primero
        try {
          await signInWithEmailAndPassword(auth, email, password)
        } catch (loginError) {
          // Si falla, intentar login con invitación
          if (
            typeof loginError === 'object' &&
            loginError !== null &&
            'code' in loginError &&
            (loginError.code === 'auth/user-not-found' ||
              loginError.code === 'auth/wrong-password' ||
              loginError.code === 'auth/invalid-credential')
          ) {
            const { loginWithInvitation } = await import('@/db/users')
            try {
              await loginWithInvitation(email, password)
              toast.success('¡Bienvenido! Tu cuenta ha sido activada.')
              return
            } catch {
              throw loginError // Mostrar error original si ambos fallan
            }
          } else {
            throw loginError
          }
        }

        // Si login normal fue exitoso, actualizar lastLoginAt
        const user = auth.currentUser
        if (user) {
          const { doc, updateDoc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          
          const userRef = doc(db, 'users', user.uid)
          await updateDoc(userRef, { lastLoginAt: new Date().toISOString() })
        }

        toast.success('Inicio de sesión exitoso')
      }
    } catch (err: unknown) {
      toast.error('Error al autenticar')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const title = mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'
  const actionLabel = mode === 'signup' ? 'Crear cuenta' : 'Ingresar'

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
          <Button onClick={handleAuth} disabled={loading} className="w-full flex items-center justify-center gap-1">
            {loading ? <LoadingSpinner className="h-4 w-4" /> : actionLabel}
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
  flex flex-col items-center justify-center min-h-screen px-4 w-full
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