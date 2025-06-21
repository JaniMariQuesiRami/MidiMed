'use client'
import { useEffect, useState } from 'react'
import { getOrganization, updateOrganization } from '@/db/organization'
import { useUser } from '@/contexts/UserContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'

export default function OrganizationSettingsPage() {
  const { tenant } = useUser()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!tenant) return
    getOrganization(tenant.tenantId).then((t) => {
      setName(t.name)
      setPhone(t.phone)
      setAddress(t.address)
    })
  }, [tenant])

  if (!tenant) return null

  const save = async () => {
    await updateOrganization(tenant.tenantId, { name, phone, address })
  }

  return (
    <Wrapper>
      <h1 className="text-lg font-medium">Ajustes de la clínica</h1>
      <div className="space-y-3 max-w-md">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
        <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" />
        <Button onClick={save}>Guardar</Button>
      </div>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4`
