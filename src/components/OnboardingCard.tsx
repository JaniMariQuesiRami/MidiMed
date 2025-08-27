'use client'

import { useContext, useEffect, useState } from 'react'
import tw from 'tailwind-styled-components'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/contexts/UserContext'
import type { OnboardingProgress } from '@/types/db'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

const steps = [
  { key: 'createPatient', label: 'Crear paciente', href: '/patients' },
  { key: 'createAppointment', label: 'Crear cita', href: '/patients' },
  { key: 'viewCalendar', label: 'Ver en calendario', href: '/dashboard' },
  { key: 'viewAppointmentInfo', label: 'Ver información de cita', href: '/dashboard' },
  { key: 'completeAppointment', label: 'Completar una cita', href: '/dashboard' },
] as const

type StepKey = (typeof steps)[number]['key']

export default function OnboardingCard() {
  const { tenant } = useContext(UserContext)
  const [progress, setProgress] = useState<OnboardingProgress | null>(tenant?.onboarding ?? null)
  const router = useRouter()

  useEffect(() => {
    if (!tenant) return
    const unsub = onSnapshot(doc(db, 'tenants', tenant.tenantId), (snap) => {
      const data = snap.data() as { onboarding?: OnboardingProgress } | undefined
      setProgress(data?.onboarding ?? null)
    })
    return () => unsub()
  }, [tenant])

  if (!tenant || !progress) return null

  const total = steps.length
  const completed = steps.filter((s) => progress[s.key as StepKey]).length
  if (completed === total) return null

  const percentage = Math.round((completed / total) * 100)

  return (
    <Card>
      <p className="text-sm font-medium mb-2">Progreso</p>
      <ProgressBar>
        <Progress style={{ width: `${percentage}%` }} />
      </ProgressBar>
      <ul className="mt-2 space-y-1 text-xs">
        {steps.map((step, idx) => (
          <li key={step.key}>
            <button
              className={`flex items-center gap-2 w-full text-left cursor-pointer ${progress[step.key as StepKey] ? 'text-muted-foreground line-through' : ''}`}
              onClick={() => router.push(step.href)}
            >
              <span className="font-medium">{idx + 1}.</span>
              {step.label}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

const Card = tw.div`mt-4 p-3 rounded-lg bg-muted`
const ProgressBar = tw.div`w-full h-2 bg-border rounded-full`
const Progress = tw.div`h-full bg-primary rounded-full`
