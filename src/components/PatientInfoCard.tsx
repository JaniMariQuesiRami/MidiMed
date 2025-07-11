'use client'

import tw from 'tailwind-styled-components'
import { Button } from '@/components/ui/button'
import { Pencil, User2 } from 'lucide-react'
import type { Patient } from '@/types/db'
import { format } from 'date-fns'

export default function PatientInfoCard({
  patient,
  onEdit,
}: {
  patient: Patient
  onEdit: () => void
}) {
  return (
    <CardContainer>
      <Content>
        <Header>
          <Avatar>
            <User2 className="w-5 h-5 text-muted-foreground" />
          </Avatar>
          <div>
            <Name>{patient.firstName} {patient.lastName}</Name>
            {patient.email && <Detail>{patient.email}</Detail>}
            {patient.phone && <Detail>{patient.phone}</Detail>}
          </div>
        </Header>

        <Divider />

        <Section>
          <Field>
            <Label>Fecha de nacimiento</Label>
            <Value>{safeFormatDate(patient.birthDate)}</Value>
          </Field>
          <Field>
            <Label>Sexo</Label>
            <Value>{translateSex(patient.sex)}</Value>
          </Field>
          {patient.address && (
            <Field>
              <Label>Dirección</Label>
              <Value>{patient.address}</Value>
            </Field>
          )}
          <Field>
            <Label>Creado el</Label>
            <Value>{safeFormatDate(patient.createdAt)}</Value>
          </Field>
          {patient.allergies && (
            <Field>
              <Label>Alergias</Label>
              <Value>{patient.allergies}</Value>
            </Field>
          )}
          {patient.notes && (
            <Field>
              <Label>Notas</Label>
              <Value>{patient.notes}</Value>
            </Field>
          )}
        </Section>
      </Content>

      <Button size="sm" onClick={onEdit} className="w-full mt-auto flex items-center gap-1">
        <Pencil size={14} /> Editar
      </Button>
    </CardContainer>
  )
}

const translateSex = (s: "M" | "F" | "O") => {
  switch (s) {
    case "M": return "Masculino"
    case "F": return "Femenino"
    case "O": return "Otro"
  }
}

const safeFormatDate = (dateString?: string): string => {
  if (!dateString) return 'No especificado'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Fecha inválida'
    }
    return format(date, 'dd/MM/yyyy')
  } catch {
    return 'Fecha inválida'
  }
}


const CardContainer = tw.div`
  flex flex-col border rounded-md bg-white p-4 shadow-sm w-full lg:w-64 h-full min-h-[700px]
`

const Content = tw.div`flex flex-col gap-y-4`

const Header = tw.div`flex items-center gap-4`

const Avatar = tw.div`
  w-10 h-10 rounded-full bg-muted flex items-center justify-center
`

const Name = tw.p`font-semibold text-base`

const Detail = tw.p`text-sm text-muted-foreground`

const Divider = tw.hr`border-t border-muted`

const Section = tw.div`flex flex-col gap-y-2`

const Field = tw.div`space-y-0.5`

const Label = tw.p`text-xs text-muted-foreground uppercase`

const Value = tw.p`text-sm font-medium`
