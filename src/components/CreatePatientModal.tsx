'use client'
import { useForm } from 'react-hook-form'
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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const schema = z.object({
  firstName: z.string().nonempty('Nombre'),
  lastName: z.string().nonempty('Apellido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function CreatePatientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, tenant } = useUser()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  })
  const submit = async (values: FormValues) => {
    try {
      if (!user || !tenant) throw new Error('No user')
      await createPatient({
        ...values,
        birth: '',
        sex: 'O',
        tenantId: tenant.tenantId,
        createdBy: user.uid,
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
                  <Input type="tel" {...field} />
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
