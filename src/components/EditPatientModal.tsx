"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PatientForm, { PatientFormValues } from "./PatientForm"
import { updatePatient } from "@/db/patients"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"
import type { Patient } from "@/types/db"

export default function EditPatientModal({
  open,
  onClose,
  patient,
  onUpdated,
}: {
  open: boolean
  onClose: () => void
  patient: Patient
  onUpdated?: (p: Patient) => void
}) {
  const { user } = useUser()

  const submit = async (values: PatientFormValues) => {
    try {
      if (!user) throw new Error("No user")
      const [firstName, ...rest] = values.name.trim().split(" ")
      const lastName = rest.join(" ")
      await updatePatient(patient.patientId, {
        ...patient,
        firstName,
        lastName,
        birthDate: values.birthDate,
        allergies: values.allergies,
        notes: values.notes,
        sex: values.sex,
        ...(values.email ? { email: values.email } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.address ? { address: values.address } : {}),
      })
      const updated: Patient = {
        ...patient,
        firstName,
        lastName,
        birthDate: values.birthDate,
        allergies: values.allergies,
        notes: values.notes,
        updatedAt: new Date().toISOString(),
        sex: values.sex,
        ...(values.email ? { email: values.email } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        ...(values.address ? { address: values.address } : {}),
      }
      toast.success("Paciente actualizado")
      onUpdated?.(updated)
      onClose()
    } catch {
      toast.error("Error al guardar paciente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar paciente</DialogTitle>
        </DialogHeader>
        <PatientForm
          open={open}
          onSubmit={submit}
          onClose={onClose}
          submitLabel="Guardar"
          updatedAt={patient.updatedAt}
          initial={{
            name: `${patient.firstName} ${patient.lastName}`,
            birthDate: patient.birthDate,
            email: patient.email ?? '',
            phone: patient.phone ?? '',
            sex: patient.sex,
            address: patient.address ?? '',
            allergies: patient.allergies,
            notes: patient.notes,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
