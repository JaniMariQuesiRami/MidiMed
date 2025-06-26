'use client'
import { useContext, useEffect, useState } from 'react'
import { getUsersByTenant } from '@/db/users'
import { UserContext } from '@/contexts/UserContext'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import InviteUserModal from './InviteUserModal'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import type { User } from '@/types/db'

export default function TeamSettings() {
  const { tenant } = useContext(UserContext)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const loadUsers = async () => {
    if (!tenant) return
    setLoading(true)
    try {
      const list = await getUsersByTenant(tenant.tenantId)
      setUsers(list)
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant])

  const onInvited = () => {
    setInviteOpen(false)
    loadUsers()
  }

  if (!tenant) return null

  return (
    <Wrapper>
      <Header>
        <h1 className="text-lg font-medium">Equipo</h1>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          + Invitar usuario
        </Button>
      </Header>
      {loading ? (
        <div className="p-4 flex justify-center">
          <LoadingSpinner className="h-5 w-5" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Último acceso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-4 text-center">
                  Sin usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <RoleTag $role={u.role}>{u.role}</RoleTag>
                  </TableCell>
                  <TableCell>{format(new Date(u.createdAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {u.lastLoginAt ? format(new Date(u.lastLoginAt), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={onInvited} />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex justify-between items-center`
const RoleTag = tw.span<{ $role: string }>`px-2 py-0.5 rounded text-xs capitalize
  ${({ $role }) => ($role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted')}`
