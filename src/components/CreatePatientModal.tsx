'use client'
import { useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPatient } from '@/db/patients'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Patient } from '@/types/db'

const schema = z.object({
  firstName: z.string().nonempty('Nombre'),
  lastName: z.string().nonempty('Apellido'),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+\d{1,3}\s?\d{8}$/).optional(),
  birth: z.string().nonempty('Fecha de nacimiento'),
  sex: z.enum(['M', 'F', 'O'], { required_error: 'Sexo requerido' }),
})

type FormValues = z.infer<typeof schema>

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
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      birth: '',
      sex: 'O',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birth: '',
        sex: 'O',
      })
    }
  }, [open, form])

  const submit = async (values: FormValues) => {
    try {
      if (!user || !tenant) throw new Error('No user')
      const patientId = await createPatient({
        ...values,
        tenantId: tenant.tenantId,
        createdBy: user.uid,
      })
      onCreated?.({
        patientId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        birth: values.birth,
        sex: values.sex,
        tenantId: tenant.tenantId,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      })
      toast.success('Paciente creado')
      onClose()
    } catch {
      toast.error('Error al crear paciente')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo paciente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <Input type="tel" pattern="^\\+\\d{1,3}\\s?\\d{8}$" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <Input type="date" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
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
