'use client'

import { Suspense } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'
import PaymentSuccessContent from './PaymentSuccessContent'

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
