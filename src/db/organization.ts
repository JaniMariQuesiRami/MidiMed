import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { Tenant, OrganizationSettingsInput, ExtraFieldDef } from '@/types/db'

export async function getOrganization(tenantId: string): Promise<Tenant> {
  try {
    const snap = await getDoc(doc(db, 'tenants', tenantId))
    if (!snap.exists()) throw new Error('Organization not found')
    return snap.data() as Tenant
  } catch (err) {
    console.error('Error in getOrganization:', err)
    throw err
  }
}

export async function updateOrganization(tenantId: string, data: OrganizationSettingsInput): Promise<void> {
  try {
    await updateDoc(doc(db, 'tenants', tenantId), data)
  } catch (err) {
    console.error('Error in updateOrganization:', err)
    throw err
  }
}

export async function updateExtraFields(
  tenantId: string,
  extraFields: ExtraFieldDef[],
): Promise<void> {
  try {
    await updateDoc(doc(db, 'tenants', tenantId), {
      'settings.extraFields': extraFields,
    })
  } catch (err) {
    console.error('Error in updateExtraFields:', err)
    throw err
  }
}
