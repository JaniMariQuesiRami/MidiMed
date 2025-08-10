'use client'

import { useEffect, useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'

interface Step {
  selector: string
  content: string
}

const Overlay = tw.div`fixed inset-0 bg-black/50 z-40`
const Tooltip = tw.div`absolute bg-background text-foreground border border-border rounded-lg shadow-lg p-4 w-64 z-50`
const Actions = tw.div`mt-4 flex justify-end gap-2`

export default function DashboardTutorial() {
  const steps: Step[] = useMemo(
    () => [
      { selector: '[data-tour="nav-dashboard"]', content: 'Aquí puedes ver tu calendario de citas.' },
      { selector: '[data-tour="nav-patients"]', content: 'Gestiona tus pacientes desde aquí.' },
      { selector: '[data-tour="nav-notifications"]', content: 'Consulta tus notificaciones.' },
      { selector: '[data-tour="nav-reports"]', content: 'Genera y revisa reportes.' },
      { selector: '[data-tour="nav-settings"]', content: 'Configura la aplicación a tu gusto.' },
      { selector: '[data-tour="user-card"]', content: 'Accede a la configuración de tu cuenta.' },
    ],
    [],
  )

  const [step, setStep] = useState<number>(-1)
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem('dashboardTutorialSeen')
      const isDesktop = window.innerWidth >= 768
      if (!seen && isDesktop) {
        setStep(0)
      }
    } catch (err) {
      console.error('Error initializing dashboard tutorial:', err)
    }
  }, [])

  useEffect(() => {
    if (step < 0 || step >= steps.length) return
    const current = steps[step]
    const el = document.querySelector(current.selector) as HTMLElement | null
    if (!el) return
    el.classList.add('tutorial-highlight')
    const rect = el.getBoundingClientRect()
    setPos({ top: rect.bottom + 8, left: rect.left })
    return () => {
      el.classList.remove('tutorial-highlight')
    }
  }, [step, steps])

  const finish = () => {
    try {
      window.localStorage.setItem('dashboardTutorialSeen', 'true')
    } catch (err) {
      console.error('Error saving dashboard tutorial state:', err)
    }
    setStep(-1)
  }

  const next = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      finish()
    }
  }

  const skip = () => finish()

  if (step < 0 || step >= steps.length) return null

  return (
    <>
      <Overlay onClick={skip} />
      <Tooltip style={{ top: pos.top, left: pos.left }}>
        <p>{steps[step].content}</p>
        <Actions>
          <Button variant="secondary" size="sm" onClick={skip} type="button">
            Omitir
          </Button>
          <Button size="sm" onClick={next} type="button">
            {step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </Button>
        </Actions>
      </Tooltip>
    </>
  )
}

