'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { inviteUser } from '@/db/users'
import { UserContext } from '@/contexts/UserContext'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import type { UserRole } from '@/types/db'
import { useState, useContext } from 'react'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  role: z.enum(['admin', 'provider', 'staff']),
})

export type InviteFormValues = z.infer<typeof schema>

export default function InviteUserModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean
  onClose: () => void
  onInvited?: () => void
}) {
  const { tenant, user } = useContext(UserContext)
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: 'staff' },
  })
  const [loading, setLoading] = useState(false)

  const submit = async (values: InviteFormValues) => {
    if (!tenant) return
    try {
      setLoading(true)
      await inviteUser(tenant.tenantId, values.email, values.role as UserRole, user?.uid)
      setLoading(false)
      toast.success('Usuario invitado')
      form.reset({ email: '', role: 'staff' })
      onInvited?.()
    } catch {
      toast.error('No se pudo invitar usuario')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-3" autoComplete='off'>
          <div className="space-y-1">
            <Input placeholder="correo@ejemplo.com" {...form.register('email')} />
            {form.formState.errors.email && (
              <ErrorText>{form.formState.errors.email.message}</ErrorText>
            )}
          </div>
          <div className="space-y-1">
            <Select
              value={form.watch('role')}
              onValueChange={(v) => form.setValue('role', v as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <ErrorText>{form.formState.errors.role.message}</ErrorText>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Invitando...' : 'Invitar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ErrorText = tw.p`text-sm text-destructive`
