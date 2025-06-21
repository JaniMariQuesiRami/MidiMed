'use client'
import { useEffect, useState } from 'react'
import { getPatients } from '@/db/patients'
import { useUser } from '@/contexts/UserContext'
import type { Patient } from '@/types/db'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import tw from 'tailwind-styled-components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import CreatePatientModal from '@/components/CreatePatientModal'

export default function PatientsPage() {
  const { tenant } = useUser()
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!tenant) return
    getPatients(tenant.tenantId).then(setPatients).catch(() => {})
  }, [tenant])

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Wrapper>
      <Header>
        <Input
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <button
          className="bg-primary text-white px-3 py-1 rounded flex items-center gap-1"
          onClick={() => setOpen(true)}
        >
          Nuevo <Plus size={16} />
        </button>
      </Header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((p) => (
            <TableRow
              key={p.patientId}
              className="cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/patients/${p.patientId}`)}
            >
              <TableCell>
                {p.firstName} {p.lastName}
              </TableCell>
              <TableCell>{p.email}</TableCell>
              <TableCell>{p.phone}</TableCell>
              <TableCell>
                <Link className="text-primary" href={`/patients/${p.patientId}`}>Ver</Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CreatePatientModal open={open} onClose={() => setOpen(false)} />
    </Wrapper>
  )
}

const Wrapper = tw.div`flex flex-col gap-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex justify-between items-center`
