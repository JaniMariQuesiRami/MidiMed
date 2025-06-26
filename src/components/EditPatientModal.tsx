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
      const contact = /@/.test(values.contact)
        ? { email: values.contact, phone: undefined }
        : { phone: values.contact, email: undefined }
      await updatePatient(patient.patientId, {
        ...patient,
        firstName,
        lastName,
        birthDate: values.birthDate,
        allergies: values.allergies,
        notes: values.notes,
        ...contact,
        sex: patient.sex,
      })
      const updated: Patient = {
        ...patient,
        firstName,
        lastName,
        birthDate: values.birthDate,
        allergies: values.allergies,
        notes: values.notes,
        ...contact,
        updatedAt: new Date().toISOString(),
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
            contact: patient.email ?? patient.phone ?? "",
            allergies: patient.allergies,
            notes: patient.notes,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
