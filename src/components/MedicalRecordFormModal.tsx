'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMedicalRecord } from '@/db/patients'
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
}: {
  open: boolean
  onClose: () => void
  patientId: string
  onCreated?: (rec: MedicalRecord) => void
}) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const submit = async (values: FormValues) => {
    try {
      const recordId = await createMedicalRecord(patientId, {
        summary: values.summary,
        details: { heightCm: 0, weightKg: 0, bloodPressure: '', notes: '' },
        createdBy: 'system',
      })
      const newRec: MedicalRecord = {
        tenantId: '',
        patientId,
        recordId,
        summary: values.summary,
        details: { heightCm: 0, weightKg: 0, bloodPressure: '', notes: '' },
        createdAt: new Date().toISOString(),
        createdBy: 'system',
      }
      toast.success('Registro creado')
      onCreated?.(newRec)
      onClose()
    } catch {
      toast.error('Error al crear registro')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo registro</DialogTitle>
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
              Crear <Plus size={16} />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

