// Error state component for the public clinic chat portal.
// Displays contextual messages based on the reason the clinic page cannot be shown.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-A)

type ClinicNotFoundProps = {
  reason: "not-found" | "inactive" | "disabled"
}

const messages: Record<ClinicNotFoundProps["reason"], { title: string; description: string }> = {
  "not-found": {
    title: "Clínica no encontrada",
    description: "El enlace que seguiste no corresponde a ninguna clínica registrada.",
  },
  inactive: {
    title: "Portal temporalmente no disponible",
    description:
      "El portal de esta clínica no está disponible en este momento. Por favor, contacta a la clínica directamente.",
  },
  disabled: {
    title: "Portal no disponible",
    description:
      "Esta clínica no ha habilitado su portal público. Por favor, contacta a la clínica directamente.",
  },
}

export default function ClinicNotFound({ reason }: ClinicNotFoundProps) {
  const { title, description } = messages[reason]

  return (
    <div className="flex h-dvh items-center justify-center bg-background p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-8 w-8 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground">Powered by MidiMed</p>
      </div>
    </div>
  )
}
