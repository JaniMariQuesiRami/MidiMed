'use client'

import { useContext, useEffect, useState, Suspense } from 'react'
import { getPatients } from '@/db/patients'
import { UserContext } from '@/contexts/UserContext'
import type { Patient } from '@/types/db'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import tw from 'tailwind-styled-components'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import CreatePatientModal from '@/components/CreatePatientModal'
import LoadingSpinner from '@/components/LoadingSpinner'

const PAGE_SIZE = 10

// Component that handles search params (needs to be wrapped in Suspense)
function PatientsWithSearchParams() {
  const searchParams = useSearchParams()
  return <PatientsPage searchParams={searchParams} />
}

function PatientsPage({ searchParams }: { searchParams: ReturnType<typeof useSearchParams> }) {
  const { tenant } = useContext(UserContext)
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const router = useRouter()

  // Abrir modal automáticamente si viene del onboarding
  useEffect(() => {
    const modalParam = searchParams.get('modal')
    if (modalParam === 'createPatient') {
      setOpen(true)
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href)
      url.searchParams.delete('modal')
      window.history.replaceState({}, '', url)
    }
  }, [searchParams])

  useEffect(() => {
    if (!tenant) return
    setLoading(true)
    getPatients(tenant.tenantId)
      .then(setAllPatients)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenant])

  const filtered = allPatients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    return (
      name.includes(search.toLowerCase()) ||
      p.patientId.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase())
    )
  })

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <Wrapper>
      <Header>
        <Input
          placeholder="Busca por nombre, teléfono, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          className="max-w-sm"
        />
        <button
          id="create-patient-btn"
          className="bg-primary text-white px-3 py-1 rounded flex items-center gap-1 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Nuevo <Plus size={16} />
        </button>
      </Header>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[100px]">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="min-w-[150px]">Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="min-w-[150px]">Teléfono</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center">
                  <LoadingSpinner className="h-6 w-6 mx-auto" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center">
                  No se encontraron pacientes
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((p) => (
                <TableRow
                  key={p.patientId}
                  className="cursor-pointer hover:bg-[var(--primary-soft)]"
                  onClick={() => router.push(`/patients/${p.patientId}`)}
                >
                  <TableCell className="min-w-max">{p.firstName} {p.lastName}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell className="min-w-max">{p.phone}</TableCell>
                  <TableCell>
                    <Link className="text-primary" href={`/patients/${p.patientId}`}>Ver</Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex justify-between items-center p-2 text-sm">
            <span className="text-muted-foreground">
              Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="text-primary hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="text-primary hover:underline disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <CreatePatientModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(p) => setAllPatients((prev) => [p, ...prev])}
      />
    </Wrapper>
  )
}

const Wrapper = tw.div`flex flex-col gap-4 px-2 sm:px-4 pt-8`
const Header = tw.div`
  flex flex-row gap-2 justify-between items-center
`

// Default export with Suspense boundary
export default function Patients() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PatientsWithSearchParams />
    </Suspense>
  )
}
