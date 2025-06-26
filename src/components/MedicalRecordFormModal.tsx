'use client'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMedicalRecord, updateMedicalRecord } from '@/db/patients'
import { updateAppointment } from '@/db/appointments'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { MedicalRecord } from '@/types/db'

const schema = z.object({
  summary: z.string().nonempty('Resumen requerido'),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  bloodPressure: z.string().optional(),
  temperatureC: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.string().optional(),
  followUp: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function MedicalRecordFormModal({
  open,
  onClose,
  patientId,
  appointmentId,
  patientBirthDate,
  onCreated,
  record,
  onUpdated,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId?: string | null
  patientBirthDate?: string
  onCreated?: (rec: MedicalRecord) => void
  record?: MedicalRecord | null
  onUpdated?: (rec: MedicalRecord) => void
}) {
  const { user, tenant } = useUser()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      summary: '',
      heightCm: '',
      weightKg: '',
      bloodPressure: '',
      temperatureC: '',
      diagnosis: '',
      medications: '',
      followUp: '',
      notes: '',
    },
  })


  useEffect(() => {
    if (open)
      form.reset({
        summary: record?.summary ?? '',
        heightCm: record?.details.heightCm?.toString() ?? '',
        weightKg: record?.details.weightKg?.toString() ?? '',
        bloodPressure: record?.details.bloodPressure ?? '',
        temperatureC: record?.details.temperatureC?.toString() ?? '',
        diagnosis: record?.details.diagnosis ?? '',
        medications: record?.details.prescribedMedications?.join(', ') ?? '',
        followUp: record?.details.followUpInstructions ?? '',
        notes: record?.details.notes ?? '',
      })
  }, [open, record, form])

  const submit = async (values: FormValues) => {
    try {
      if (!user || !tenant) throw new Error('No user')
      const details = {
        heightCm: values.heightCm ? Number(values.heightCm) : undefined,
        weightKg: values.weightKg ? Number(values.weightKg) : undefined,
        bloodPressure: values.bloodPressure || undefined,
        temperatureC: values.temperatureC ? Number(values.temperatureC) : undefined,
        age: patientBirthDate
          ? Math.floor(
              (Date.now() - new Date(patientBirthDate).getTime()) /
                (1000 * 60 * 60 * 24 * 365.25),
            )
          : undefined,
        diagnosis: values.diagnosis || undefined,
        prescribedMedications: values.medications
          ? values.medications.split(',').map((m) => m.trim()).filter(Boolean)
          : undefined,
        followUpInstructions: values.followUp || undefined,
        notes: values.notes || undefined,
        summary: values.summary,
      }
      if (record) {
        await updateMedicalRecord(record.recordId, {
          ...record,
          summary: values.summary,
          details,
          ...(appointmentId ? { appointmentId } : {}),
        })
        toast.success('Registro actualizado')
        onUpdated?.({ ...record, summary: values.summary, details, ...(appointmentId ? { appointmentId } : {}) })
      } else {
        const recordId = await createMedicalRecord(patientId, {
          summary: values.summary,
          details,
          tenantId: tenant.tenantId,
          createdBy: user.uid,
          patientId,
          ...(appointmentId ? { appointmentId } : {}),
        })
        if (appointmentId) {
          await updateAppointment(appointmentId, {
            status: 'completed',
            medicalRecordId: recordId,
          })
        }
        const newRec: MedicalRecord = {
          tenantId: tenant.tenantId,
          patientId,
          recordId,
          summary: values.summary,
          details,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          ...(appointmentId ? { appointmentId } : {}),
        }
        toast.success('Registro creado')
        onCreated?.(newRec)
      }
      onClose()
    } catch {
      toast.error('Error al guardar registro')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{record ? 'Editar registro' : 'Nuevo registro'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resumen</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="heightCm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso (kg)</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodPressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presión</FormLabel>
                    <Input {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperatureC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura (°C)</FormLabel>
                    <Input type="number" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico</FormLabel>
                  <Textarea {...field} rows={2} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos</FormLabel>
                  <Input {...field} placeholder="sepárelos con coma" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="followUp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instrucciones de seguimiento</FormLabel>
                  <Textarea {...field} rows={2} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <Textarea {...field} rows={2} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full flex items-center gap-1"
              disabled={form.formState.isSubmitting}
            >
              {record ? 'Guardar' : <>Crear <Plus size={16} /></>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

