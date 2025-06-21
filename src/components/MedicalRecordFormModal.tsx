'use client'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMedicalRecord, updateMedicalRecord } from '@/db/patients'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { MedicalRecord } from '@/types/db'

const schema = z.object({
  summary: z.string().nonempty('Resumen'),
})

type FormValues = z.infer<typeof schema>

export default function MedicalRecordFormModal({
  open,
  onClose,
  patientId,
  onCreated,
  record,
  onUpdated,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  onCreated?: (rec: MedicalRecord) => void
  record?: MedicalRecord | null
  onUpdated?: (rec: MedicalRecord) => void
}) {
  const { user, tenant } = useUser()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { summary: '' },
  })

  useEffect(() => {
    if (open)
      form.reset({ summary: record?.summary ?? '' })
  }, [open, record, form])

  const submit = async (values: FormValues) => {
    try {
      if (!user || !tenant) throw new Error('No user')
      if (record) {
        await updateMedicalRecord(record.recordId, {
          ...record,
          summary: values.summary,
        })
        toast.success('Registro actualizado')
        onUpdated?.({ ...record, summary: values.summary })
      } else {
        const recordId = await createMedicalRecord(patientId, {
          summary: values.summary,
          details: { heightCm: 0, weightKg: 0, bloodPressure: '', notes: '' },
          tenantId: tenant.tenantId,
          createdBy: user.uid,
          patientId: patientId,
        })
        const newRec: MedicalRecord = {
          tenantId: tenant.tenantId,
          patientId,
          recordId,
          summary: values.summary,
          details: { heightCm: 0, weightKg: 0, bloodPressure: '', notes: '' },
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
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
            <Button type="submit" className="w-full flex items-center gap-1">
              {record ? 'Guardar' : <>Crear <Plus size={16} /></>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

