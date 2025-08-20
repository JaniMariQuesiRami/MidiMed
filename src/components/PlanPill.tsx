'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { TenantBilling } from '@/types/db'
import { addDays, parseISO } from 'date-fns'

const TZ = 'America/Guatemala'

function formatDate(date: Date) {
  return date.toLocaleString('es-GT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export default function PlanPill({ billing }: { billing?: TenantBilling }) {
  if (!billing) return null

  const colors: Record<string, string> = {
    TRIAL: 'bg-yellow-200 text-yellow-800',
    BASIC: 'bg-blue-200 text-blue-800',
    PRO: 'bg-purple-200 text-purple-800',
    ENTERPRISE: 'bg-green-200 text-green-800',
  }

  const body = (() => {
    const now = new Date()
    if (billing.status === 'TRIAL_ACTIVE' && billing.trialStartAt) {
      const trialEnd = addDays(parseISO(billing.trialStartAt), billing.trialDays ?? 15)
      const diffMs = trialEnd.getTime() - now.getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        if (diffDays > 0) {
          return `Te quedan ${diffDays} ${diffDays === 1 ? 'día' : 'días'}. Inicio: ${formatDate(parseISO(billing.trialStartAt))}. Fin: ${formatDate(trialEnd)}.`
        } else {
          const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))
          return `Te quedan ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}. Inicio: ${formatDate(parseISO(billing.trialStartAt))}. Fin: ${formatDate(trialEnd)}.`
        }
      }
      return 'Tu prueba terminó.'
    }
    if (billing.status === 'TRIAL_EXPIRED') {
      return 'Tu prueba terminó.'
    }
    if (billing.status === 'PAID_ACTIVE') {
      return billing.paidThrough ? `Válido hasta: ${formatDate(parseISO(billing.paidThrough))}.` : ''
    }
    if (billing.status === 'PAST_DUE') {
      return billing.paidThrough ? `Pago pendiente. Venció: ${formatDate(parseISO(billing.paidThrough))}.` : ''
    }
    return ''
  })()

  const pill = (
    <span
      className={`px-2 py-0.5 text-xs rounded-full font-medium ${colors[billing.plan] ?? 'bg-gray-200 text-gray-800'}`}
    >
      {billing.plan}
    </span>
  )

  if (!body) return pill

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold mb-1">Plan {billing.plan}</p>
          <p className="max-w-xs whitespace-pre-line">{body}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
