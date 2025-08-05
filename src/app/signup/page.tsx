"use client"

import { useEffect } from 'react'
import AuthForm from '@/components/AuthForm'
import AuthScreenLayout from '@/components/AuthScreenLayout'
import { useUser } from '@/contexts/UserContext'
import { trackEvent } from '@/utils/trackEvent'

export default function SignupPage() {
  const { user, tenant } = useUser()

  useEffect(() => {
    trackEvent('Visited Registration Page', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
  }, [user?.uid, tenant?.tenantId])

  return (
    <AuthScreenLayout>
      <AuthForm mode="signup" />
    </AuthScreenLayout>
  )
}
