import type { TenantBillingStatus, TenantPlanType } from '@/types/db'

// Plan name translations
export const planTranslations: Record<TenantPlanType, string> = {
  TRIAL: 'Prueba',
  BASIC: 'Básico',
  PRO: 'Pro',
  ENTERPRISE: 'Empresarial',
}

// Status translations
export const statusTranslations: Record<TenantBillingStatus, string> = {
  TRIAL_ACTIVE: 'Prueba Activa',
  TRIAL_EXPIRED: 'Prueba Expirada',
  PAID_ACTIVE: 'Plan Activo',
  PAST_DUE: 'Pago Pendiente',
}

// Helper function to get translated plan name
export function getTranslatedPlanName(plan: TenantPlanType): string {
  return planTranslations[plan] || plan
}

// Helper function to get translated status
export function getTranslatedStatus(status: TenantBillingStatus): string {
  return statusTranslations[status] || status
}
