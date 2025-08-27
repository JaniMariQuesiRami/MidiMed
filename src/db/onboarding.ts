import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import type { OnboardingProgress } from '@/types/db'

export type OnboardingStep = keyof OnboardingProgress

export async function completeOnboardingStep(tenantId: string, step: OnboardingStep): Promise<void> {
  try {
    await updateDoc(doc(db, 'tenants', tenantId), {
      [`onboarding.${step}`]: true,
    })
  } catch (err) {
    console.error('Error in completeOnboardingStep:', err)
    throw err
  }
}

export async function resetOnboardingProgress(tenantId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'tenants', tenantId), {
      'onboarding.createPatient': false,
      'onboarding.createAppointment': false,
      'onboarding.viewAppointmentInfo': false,
      'onboarding.completeAppointment': false,
      'onboarding.visitSettings': false,
    })
  } catch (err) {
    console.error('Error in resetOnboardingProgress:', err)
    throw err
  }
}
