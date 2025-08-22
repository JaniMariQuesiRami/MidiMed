"use client"

import { useEffect, Suspense } from 'react'
import MultiStepSignupForm from '@/components/MultiStepSignupForm'
import AuthScreenLayout from '@/components/AuthScreenLayout'
import { useUser } from '@/contexts/UserContext'
import { trackEvent } from '@/utils/trackEvent'
import LoadingSpinner from '@/components/LoadingSpinner'

function SignupContent() {
  const { user, tenant } = useUser()

  useEffect(() => {
    trackEvent('Visited Registration Page', {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    })
  }, [user?.uid, tenant?.tenantId])

  return <MultiStepSignupForm />
}

export default function SignupPage() {
  return (
    <AuthScreenLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      }>
        <SignupContent />
      </Suspense>
    </AuthScreenLayout>
  )
}
