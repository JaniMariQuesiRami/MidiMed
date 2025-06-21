'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { getPatients } from '@/db/patients'
import { createAppointment } from '@/db/appointments'
import type { Patient, Appointment } from '@/types/db'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const schema = z.object({
  patientId: z.string().nonempty('Seleccione paciente'),
  providerId: z.string().nonempty('Doctor'),
  date: z.string().nonempty('Fecha'),
  time: z.string().nonempty('Hora'),
  duration: z.string().nonempty('Duración'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  patientId,
}: {
  open: boolean
  onClose: () => void
  onCreated?: (appt: Appointment) => void
  patientId?: string
}) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: patientId ?? '' },
  })

  useEffect(() => {
    form.setValue('patientId', patientId ?? '')
  }, [patientId, form])

  useEffect(() => {
    if (!open) return
    getPatients().then(setPatients).catch(() => toast.error('Error cargando pacientes'))
  }, [open])

  const submit = async (values: FormValues) => {
    setLoading(true)
    try {
      const start = new Date(`${values.date}T${values.time}`)
      const end = new Date(start.getTime() + Number(values.duration) * 60000)
      const appointmentId = await createAppointment({
        patientId: values.patientId,
        providerId: values.providerId,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        status: 'scheduled',
        reason: values.notes ?? '',
        medicalRecordId: null,
      })
      const newAppt: Appointment = {
        appointmentId,
        tenantId: '',
        patientId: values.patientId,
        providerId: values.providerId,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        status: 'scheduled',
        reason: values.notes ?? '',
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        medicalRecordId: null,
      }
      toast.success('Cita creada')
      onCreated?.(newAppt)
      onClose()
    } catch (err) {
      toast.error('No se pudo crear cita')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="space-y-3"
          >
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.patientId} value={p.patientId}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="providerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Fecha</FormLabel>
                    <Input type="date" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Hora</FormLabel>
                    <Input type="time" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (min)</FormLabel>
                  <Input type="number" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Guardando...' : 'Crear'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
