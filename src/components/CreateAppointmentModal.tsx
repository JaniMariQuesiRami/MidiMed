'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { getPatients } from '@/db/patients'
import {
  createAppointment,
  updateAppointment,
  getAppointmentsInRange,
} from '@/db/appointments'
import { useUser } from '@/contexts/UserContext'
import type { Patient, Appointment } from '@/types/db'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import LoadingSpinner from './LoadingSpinner'
import { startOfDay, endOfDay, getDaysInMonth, format } from 'date-fns'
import { getWorkingHoursForDate, generateTimeSlots } from '@/lib/scheduling'

const schema = z.object({
  patientId: z.string().nonempty('Seleccione paciente'),
  providerId: z.string().nonempty('Doctor'),
  year: z.string().nonempty('Año'),
  month: z.string().nonempty('Mes'),
  day: z.string().nonempty('Día'),
  startTime: z.string().nonempty('Hora'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: (appt: Appointment) => void
  patientId?: string
  appointment?: Appointment | null
  onUpdated?: (appt: Appointment) => void
  initialDate?: Date | null
  initialStart?: Date | null
}

export default function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  patientId,
  appointment,
  onUpdated,
  initialDate,
  initialStart,
}: Props) {
  const { user, tenant } = useUser()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [times, setTimes] = useState<string[]>([])
  const currentYear = new Date().getFullYear().toString()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: appointment?.patientId ?? patientId ?? '',
      providerId: appointment?.providerId ?? '',
      year: currentYear,
      month: '',
      day: '',
      startTime: '',
      notes: appointment?.reason ?? '',
    },
  })

  const resetForm = () => {
    const baseDate = appointment
      ? new Date(appointment.scheduledStart)
      : initialStart ?? initialDate ?? new Date()
    const year = baseDate.getFullYear().toString()
    const month = (baseDate.getMonth() + 1).toString().padStart(2, '0')
    const day = baseDate.getDate().toString().padStart(2, '0')
    const startTime = appointment
      ? format(new Date(appointment.scheduledStart), 'HH:mm')
      : initialStart
        ? format(initialStart, 'HH:mm')
        : ''
    form.reset({
      patientId: appointment?.patientId ?? patientId ?? '',
      providerId: appointment?.providerId ?? '',
      year,
      month,
      day,
      startTime,
      notes: appointment?.reason ?? '',
    })
  }

  useEffect(() => {
    if (open) resetForm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientId, appointment, initialDate, initialStart])

  useEffect(() => {
    form.setValue('patientId', appointment?.patientId ?? patientId ?? '')
  }, [patientId, appointment, form])

  useEffect(() => {
    if (!open || !tenant) return
    getPatients(tenant.tenantId)
      .then(setPatients)
      .catch(() => toast.error('Error cargando pacientes'))
  }, [open, tenant])

  const watchYear = form.watch('year')
  const watchMonth = form.watch('month')
  const watchDay = form.watch('day')

  useEffect(() => {
    const loadTimes = async () => {
      if (!tenant || !watchYear || !watchMonth || !watchDay) return
      const date = new Date(Number(watchYear), Number(watchMonth) - 1, Number(watchDay))
      const hours = getWorkingHoursForDate(tenant.settings, date)
      if (!hours) {
        setTimes([])
        return
      }
      try {
        const list = await getAppointmentsInRange(
          startOfDay(date),
          endOfDay(date),
          undefined,
          tenant.tenantId,
        )
        setTimes(
          generateTimeSlots(
            date,
            hours,
            list,
            tenant.settings.appointmentDurationMinutes,
            10,
            appointment?.appointmentId,
          ),
        )
      } catch {
        setTimes([])
      }
    }
    loadTimes()
  }, [tenant, watchYear, watchMonth, watchDay, appointment])

  const watchStart = form.watch('startTime')
  const [endTime, setEndTime] = useState('')
  useEffect(() => {
    if (!tenant || !watchYear || !watchMonth || !watchDay || !watchStart) {
      setEndTime('')
      return
    }
    const date = new Date(
      Number(watchYear),
      Number(watchMonth) - 1,
      Number(watchDay),
    )
    const [h, m] = watchStart.split(':').map(Number)
    date.setHours(h, m, 0, 0)
    const end = new Date(date.getTime() + tenant.settings.appointmentDurationMinutes * 60000)
    setEndTime(format(end, 'HH:mm'))
  }, [tenant, watchYear, watchMonth, watchDay, watchStart])

  const submit = async (values: FormValues) => {
    setLoading(true)
    try {
      if (!user || !tenant) throw new Error('No user')
      const start = new Date(
        Number(values.year),
        Number(values.month) - 1,
        Number(values.day),
      )
      const [h, m] = values.startTime.split(':').map(Number)
      start.setHours(h, m, 0, 0)
      const end = new Date(start.getTime() + tenant.settings.appointmentDurationMinutes * 60000)
      if (appointment) {
        await updateAppointment(appointment.appointmentId, {
          ...appointment,
          patientId: values.patientId,
          providerId: values.providerId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          reason: values.notes ?? '',
        })
        toast.success('Cita actualizada')
        onUpdated?.({
          ...appointment,
          patientId: values.patientId,
          providerId: values.providerId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          reason: values.notes ?? '',
        })
      } else {
        const appointmentId = await createAppointment({
          patientId: values.patientId,
          providerId: values.providerId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          status: 'scheduled',
          reason: values.notes ?? '',
          medicalRecordId: null,
          tenantId: tenant.tenantId,
          createdBy: user.uid,
        })
        const newAppt: Appointment = {
          appointmentId,
          tenantId: tenant.tenantId,
          patientId: values.patientId,
          providerId: values.providerId,
          scheduledStart: start.toISOString(),
          scheduledEnd: end.toISOString(),
          status: 'scheduled',
          reason: values.notes ?? '',
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
          medicalRecordId: null,
        }
        toast.success('Cita creada')
        onCreated?.(newAppt)
      }
      onClose()
    } catch {
      toast.error('No se pudo guardar cita')
    } finally {
      setLoading(false)
    }
  }

  const daysInMonth = watchMonth ? getDaysInMonth(new Date(Number(watchYear), Number(watchMonth) - 1)) : 31
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'))

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{appointment ? 'Editar cita' : 'Nueva cita'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
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
                name="year"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Año</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={currentYear}>{currentYear}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Mes</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>
                            {i + 1}
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
                name="day"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Día</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Día" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Hora inicio</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {times.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex-1">
                <FormLabel>Fin</FormLabel>
                <Input value={endTime} readOnly />
              </div>
            </div>
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
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-1">
              {loading ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : appointment ? (
                'Guardar'
              ) : (
                <>
                  Crear <Plus size={16} />
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
