'use client'

import { useContext, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import PlanPill from '@/components/PlanPill'
import ContactUsModal from '@/components/ContactUsModal'
import tw from 'tailwind-styled-components'
import { addDays, parseISO } from 'date-fns'

const TZ = 'America/Guatemala'

function formatDate(date: Date) {
  return date.toLocaleString('es-GT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export default function PlanDetailsPanel() {
  const { tenant } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  if (!tenant) return null

  const { billing } = tenant
  const trialStart = billing.trialStartAt ? parseISO(billing.trialStartAt) : null
  const trialEnd = billing.trialStartAt
    ? addDays(parseISO(billing.trialStartAt), billing.trialDays ?? 15)
    : null
  const purchasedAt = billing.purchasedAt ? parseISO(billing.purchasedAt) : null
  const paidThrough = billing.paidThrough ? parseISO(billing.paidThrough) : null

  const remaining = (() => {
    if (billing.status === 'TRIAL_ACTIVE' && trialEnd) {
      const diffMs = trialEnd.getTime() - new Date().getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
        const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))
        return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
      }
    }
    if (billing.status === 'PAID_ACTIVE' && paidThrough) {
      const diffMs = paidThrough.getTime() - new Date().getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
      }
    }
    return null
  })()

  return (
    <Wrapper>
      <h2 className="text-lg font-medium">Plan</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span>Plan actual:</span>
          <PlanPill billing={billing} />
        </div>
        <div>
          <span className="font-medium">Estado:</span> {billing.status}
        </div>
        <div className="space-y-1">
          {trialStart && trialEnd && (
            <p>Trial: Inicio {formatDate(trialStart)} · Termina {formatDate(trialEnd)}</p>
          )}
          {purchasedAt && <p>Pagado: Comprado {formatDate(purchasedAt)}</p>}
          {paidThrough && <p>Válido hasta {formatDate(paidThrough)}</p>}
          {remaining && <p>Tiempo restante: {remaining}</p>}
        </div>
        <ContactButton onClick={() => setOpen(true)}>Contáctanos para mejorar tu plan</ContactButton>
      </div>
      <ContactUsModal open={open} onOpenChange={setOpen} />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4 pb-4`
const ContactButton = tw.button`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 cursor-pointer`
