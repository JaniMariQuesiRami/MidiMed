'use client'

import { useContext } from 'react'
import { UserContext } from '@/contexts/UserContext'
import tw from 'tailwind-styled-components'

export default function DashboardPage() {
  const { user, tenant, logout } = useContext(UserContext)

  if (!user || !tenant) return null

  return (
    <Wrapper>
      <Heading>Hola, {user.displayName}</Heading>
      <SubHeading>Bienvenido a {tenant.name}</SubHeading>
      <LogoutButton onClick={logout}>Cerrar sesión</LogoutButton>
    </Wrapper>
  )
}

// styled components
const Wrapper = tw.div`
  min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground
`

const Heading = tw.h1`
  text-3xl font-bold
`

const SubHeading = tw.p`
  text-muted-foreground mt-2
`

const LogoutButton = tw.button`
  mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition
`
