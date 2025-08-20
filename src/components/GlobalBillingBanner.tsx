'use client'

import { useContext, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import ContactUsModal from '@/components/ContactUsModal'
import tw from 'tailwind-styled-components'

export default function GlobalBillingBanner() {
  const { tenant } = useContext(UserContext)
  const [open, setOpen] = useState(false)

  if (!tenant?.billing) return null
  const { status } = tenant.billing
  if (status !== 'TRIAL_EXPIRED' && status !== 'PAST_DUE') return null

  const message =
    status === 'TRIAL_EXPIRED'
      ? 'Tu periodo de prueba terminó. Contáctanos para activar un plan.'
      : 'No hemos recibido tu renovación de plan. Se deshabilitará el acceso en los proximos 7 dias.'

  const bg =
    status === 'TRIAL_EXPIRED'
      ? 'bg-yellow-200 text-yellow-900'
      : 'bg-red-200 text-red-900'

  return (
    <>
      <Banner role="alert" aria-live="polite" className={bg}>
        <span>{message}</span>
        <button onClick={() => setOpen(true)} className="underline font-medium ml-2">
          Contáctanos
        </button>
      </Banner>
      <ContactUsModal open={open} onOpenChange={setOpen} />
    </>
  )
}

const Banner = tw.div`w-full p-2 text-center text-sm flex items-center justify-center`
