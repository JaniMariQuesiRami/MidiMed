import { useState } from 'react'

export type TutorialStep = {
  tab: 'org' | 'team' | 'forms' | 'plan'
  title: string
  description: string
}

const tutorialSteps: TutorialStep[] = [
  {
    tab: 'org',
    title: '🏥 Configuración de Organización',
    description: 'Personaliza la información de tu clínica o consultorio. Incluye datos como nombre, dirección, teléfonos de contacto y horarios de atención. Esta información se utilizará en reportes médicos, recetas y documentos oficiales.'
  },
  {
    tab: 'team',
    title: '👨‍⚕️ Gestión de Equipo Médico',
    description: 'Administra todo tu equipo de salud. Invita nuevos doctores, enfermeros o asistentes. Asigna roles y permisos específicos: algunos pueden solo ver pacientes, otros pueden crear recetas, y los administradores tienen acceso completo.'
  },
  {
    tab: 'forms',
    title: '📋 Formularios y Campos Personalizados',
    description: 'Adapta los registros médicos a tu especialidad. Agrega campos específicos como "Presión Arterial", "Glucosa", "Alergia a medicamentos" o cualquier dato que necesites capturar regularmente en tus consultas.'
  },
  {
    tab: 'plan',
    title: '💎 Suscripción y Facturación',
    description: 'Controla tu plan de suscripción actual. Ve cuántos pacientes y citas tienes disponibles, cambia a un plan superior si necesitas más capacidad, actualiza métodos de pago y revisa tu historial de facturas.'
  }
]

export function useSettingsTutorial() {
  const [tutorialActive, setTutorialActive] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

  const startTutorial = () => {
    setTutorialActive(true)
    setTutorialStep(0)
  }

  const nextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1)
    } else {
      closeTutorial()
    }
  }

  const prevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1)
    }
  }

  const closeTutorial = () => {
    setTutorialActive(false)
    setTutorialStep(0)
  }

  const currentStep = tutorialSteps[tutorialStep]

  return {
    tutorialActive,
    tutorialStep,
    tutorialSteps,
    currentStep,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial
  }
}
