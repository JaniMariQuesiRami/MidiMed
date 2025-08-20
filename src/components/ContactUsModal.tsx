'use client'

import { useContext, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UserContext } from '@/contexts/UserContext'
import { createPlanUpgradeRequest } from '@/db/billing'
import { toast } from 'sonner'

export default function ContactUsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, tenant } = useContext(UserContext)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!user || !tenant) return
    try {
      setSaving(true)
      await createPlanUpgradeRequest({
        tenantId: tenant.tenantId,
        userId: user.uid,
        currentPlan: tenant.billing?.plan || 'TRIAL',
        currentStatus: tenant.billing?.status || 'TRIAL_ACTIVE',
        message,
      })
      toast.success('Hemos recibido tu solicitud. Te contactaremos pronto.')
      setMessage('')
      onOpenChange(false)
    } catch {
      toast.error('No se pudo enviar la solicitud')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contáctanos</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Mensaje opcional"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-32"
        />
        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="ml-auto">
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
