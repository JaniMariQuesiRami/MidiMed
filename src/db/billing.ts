import { db } from '@/lib/firebase'
import { collection, doc, setDoc } from 'firebase/firestore'
import type { TenantBillingStatus, TenantPlanType, PlanUpgradeRequest } from '@/types/db'

export async function createPlanUpgradeRequest({
  tenantId,
  userId,
  currentPlan,
  currentStatus,
  message,
}: {
  tenantId: string
  userId: string
  currentPlan: TenantPlanType
  currentStatus: TenantBillingStatus
  message: string
}): Promise<void> {
  try {
    const now = new Date().toISOString()
    const ref = doc(collection(db, 'planUpgradeRequests'))
    const data: PlanUpgradeRequest = {
      requestId: ref.id,
      tenantId,
      userId,
      currentPlan,
      currentStatus,
      message,
      createdAt: now,
      handled: false,
    }
    await setDoc(ref, data)
  } catch (err) {
    console.error('Error in createPlanUpgradeRequest:', err)
    throw err
  }
}
