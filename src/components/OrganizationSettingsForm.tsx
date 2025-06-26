'use client'
import { useContext, useEffect, useState } from 'react'
import { getOrganization, updateOrganization } from '@/db/organization'
import { UserContext } from '@/contexts/UserContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'
import { toast } from 'sonner'

export default function OrganizationSettingsForm() {
  const { tenant } = useContext(UserContext)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [appointmentDuration, setAppointmentDuration] = useState(30)
  // Fix workingHours type to match TenantSettings
  type WorkingHours = {
    mon: [string, string]
    tue: [string, string]
    wed: [string, string]
    thu: [string, string]
    fri: [string, string]
    sat?: [string, string]
    sun?: [string, string]
  }
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    mon: ['08:00', '17:00'],
    tue: ['08:00', '17:00'],
    wed: ['08:00', '17:00'],
    thu: ['08:00', '17:00'],
    fri: ['08:00', '15:00'],
    sat: ['08:00', '12:00'],
    sun: ['', ''],
  })

  useEffect(() => {
    if (!tenant) return
    getOrganization(tenant.tenantId)
      .then((t) => {
        setName(t.name)
        setPhone(t.phone)
        setAddress(t.address)
        setEmail(t.email || '')
        setAppointmentDuration(t.settings?.appointmentDurationMinutes || 30)
        setWorkingHours({
          mon: t.settings?.workingHours?.mon || ['08:00', '17:00'],
          tue: t.settings?.workingHours?.tue || ['08:00', '17:00'],
          wed: t.settings?.workingHours?.wed || ['08:00', '17:00'],
          thu: t.settings?.workingHours?.thu || ['08:00', '17:00'],
          fri: t.settings?.workingHours?.fri || ['08:00', '15:00'],
          sat: t.settings?.workingHours?.sat || ['08:00', '12:00'],
          sun: t.settings?.workingHours?.sun || ['', ''],
        })
      })
      .catch(() => toast.error('Error cargando datos'))
  }, [tenant])

  if (!tenant) return null

  const save = async () => {
    try {
      await updateOrganization(tenant.tenantId, {
        name,
        email,
        phone,
        address,
        settings: {
          appointmentDurationMinutes: appointmentDuration,
          workingHours,
        },
      })
      toast.success('Guardado')
    } catch {
      toast.error('No se pudo guardar')
    }
  }

  const handleWorkingHourChange = (
    day: keyof WorkingHours,
    idx: 0 | 1,
    value: string
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: [
        idx === 0 ? value : prev[day]?.[0] || '',
        idx === 1 ? value : prev[day]?.[1] || '',
      ] as [string, string],
    }))
  }

  const days: { key: keyof WorkingHours; label: string }[] = [
    { key: 'mon', label: 'Lunes' },
    { key: 'tue', label: 'Martes' },
    { key: 'wed', label: 'Miércoles' },
    { key: 'thu', label: 'Jueves' },
    { key: 'fri', label: 'Viernes' },
    { key: 'sat', label: 'Sábado' },
    { key: 'sun', label: 'Domingo' },
  ]

  return (
    <Wrapper>
      <h1 className="text-lg font-medium">Ajustes de la clínica</h1>
      <div className="w-full flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Dirección" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duración común de cita (minutos)</label>
            <Input type="number" min={5} max={180} value={appointmentDuration} onChange={e => setAppointmentDuration(Number(e.target.value))} />
          </div>
          <Button onClick={save}>Guardar</Button>
        </div>
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Horarios de atención</label>
          <div className="grid grid-cols-1 gap-2">
            {days.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-24">{label}</span>
                <Input
                  type="time"
                  value={workingHours[key]?.[0] || ''}
                  onChange={e => handleWorkingHourChange(key, 0, e.target.value)}
                  className="w-28"
                  aria-label={`Hora inicio ${label}`}
                />
                <span>a</span>
                <Input
                  type="time"
                  value={workingHours[key]?.[1] || ''}
                  onChange={e => handleWorkingHourChange(key, 1, e.target.value)}
                  className="w-28"
                  aria-label={`Hora fin ${label}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
