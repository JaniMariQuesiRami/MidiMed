import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Tenant, OrganizationSettingsInput } from '@/types/db'

export async function getOrganization(tenantId: string): Promise<Tenant> {
  const snap = await getDoc(doc(db, 'tenants', tenantId))
  if (!snap.exists()) throw new Error('Organization not found')
  return snap.data() as Tenant
}

export async function updateOrganization(tenantId: string, data: OrganizationSettingsInput): Promise<void> {
  await updateDoc(doc(db, 'tenants', tenantId), data)
}
