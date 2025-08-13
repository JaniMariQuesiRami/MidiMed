'use client'
import { useContext, useEffect, useState } from 'react'
import { getUsersByTenant, getInvitesByTenant, updateUser } from '@/db/users'
import { UserContext } from '@/contexts/UserContext'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import InviteUserModal from './InviteUserModal'
import { format } from 'date-fns'
import tw from 'tailwind-styled-components'
import { toast } from 'sonner'
import LoadingSpinner from './LoadingSpinner'
import type { User, Invite } from '@/types/db'

export default function TeamSettings() {
  const { tenant } = useContext(UserContext)
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
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

  const loadInvites = async () => {
    if (!tenant) return
    try {
      const list = await getInvitesByTenant(tenant.tenantId)
      setInvites(list)
    } catch {
      toast.error('Error al cargar invitaciones')
    }
  }

  useEffect(() => {
    loadUsers()
    loadInvites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant])

  const onInvited = () => {
    setInviteOpen(false)
    loadUsers()
    loadInvites()
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
        <>
          {/* Tabla de usuarios activos */}
          <div className="space-y-2">
            <h2 className="text-md font-medium">Usuarios activos</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Color</TableHead>
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
                      <TableCell>
                        {u.role === 'provider' || u.role === 'admin' ? (
                          <Input
                            type="color"
                            value={u.color || '#3b82f6'}
                            className="h-8 w-8 p-0 border-none bg-transparent"
                            onChange={async (e) => {
                              const newColor = e.target.value
                              try {
                                await updateUser(u.uid, { color: newColor })
                                setUsers((prev) =>
                                  prev.map((us) =>
                                    us.uid === u.uid ? { ...us, color: newColor } : us,
                                  ),
                                )
                              } catch {
                                toast.error('No se pudo actualizar color')
                              }
                            }}
                          />
                        ) : (
                          '-'
                        )}
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
          </div>

          {/* Tabla de invitaciones pendientes */}
          {invites.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-md font-medium">Invitaciones pendientes</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Invitado</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Contraseña</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.inviteId}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <RoleTag $role={invite.role}>{invite.role}</RoleTag>
                      </TableCell>
                      <TableCell>{format(new Date(invite.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        {invite.expiresAt ? format(new Date(invite.expiresAt), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <PasswordCell>
                          <span className="font-mono text-xs">{invite.tempPassword}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={() => {
                              navigator.clipboard.writeText(invite.tempPassword || '')
                              toast.success('Contraseña copiada')
                            }}
                          >
                            📋
                          </Button>
                        </PasswordCell>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(`Email: ${invite.email}\nContraseña: ${invite.tempPassword}`)
                            toast.success('Credenciales copiadas')
                          }}
                        >
                          Copiar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
      
      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={onInvited} />
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex justify-between items-center`
const RoleTag = tw.span<{ $role: string }>`px-2 py-0.5 rounded text-xs capitalize
  ${({ $role }) => ($role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted')}`
const PasswordCell = tw.div`flex items-center`
