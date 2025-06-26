"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PatientForm, { PatientFormValues } from "./PatientForm"
import { createPatient } from "@/db/patients"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"
import type { Patient } from "@/types/db"

export default function CreatePatientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: (p: Patient) => void
}) {
  const { user, tenant } = useUser()

  const submit = async (values: PatientFormValues) => {
    try {
      if (!user || !tenant) throw new Error("No user")
      const [firstName, ...rest] = values.name.trim().split(" ")
      const lastName = rest.join(" ")
      const patientId = await createPatient({
        firstName,
        lastName,
        birthDate: values.birthDate,
        sex: "O",
        allergies: values.allergies,
        notes: values.notes,
        ...(values.email ? { email: values.email } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        tenantId: tenant.tenantId,
        createdBy: user.uid,
      })
      onCreated?.({
        tenantId: tenant.tenantId,
        patientId,
        firstName,
        lastName,
        birthDate: values.birthDate,
        sex: "O",
        allergies: values.allergies,
        notes: values.notes,
        ...(values.email ? { email: values.email } : {}),
        ...(values.phone ? { phone: values.phone } : {}),
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      toast.success("Paciente creado")
      onClose()
    } catch {
      toast.error("Error al crear paciente")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
        </DialogHeader>
        <PatientForm
          open={open}
          onSubmit={submit}
          onClose={onClose}
          submitLabel="Crear"
        />
      </DialogContent>
    </Dialog>
  )
}
