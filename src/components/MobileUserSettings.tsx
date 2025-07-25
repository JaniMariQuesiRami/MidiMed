'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { User as UserIcon, X } from 'lucide-react'
import { UserContext } from '@/contexts/UserContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { auth, db } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import tw from 'tailwind-styled-components'
import { toast } from 'sonner'

export default function MobileUserSettings() {
  const { user, tenant, logout } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (user) setDisplayName(user.displayName || '')
  }, [user])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const save = async () => {
    if (!user) return
    try {
      await updateProfile(auth.currentUser!, { displayName })
      await updateDoc(doc(db, 'users', user.uid), { displayName })
      toast.success('Perfil actualizado')
    } catch {
      toast.error('No se pudo actualizar el perfil')
    }
  }

  if (!user || !tenant) return null

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <UserIcon size={20} />
      </IconButton>
      {open && (
        <ModalOverlay>
          <ModalContent ref={modalRef}>
            <ModalHeader>
              <div className="flex items-center gap-2">
                <UserIcon size={20} className="text-primary" />
                <span>Configuración de cuenta</span>
              </div>
              <CloseButton onClick={() => setOpen(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            
            <div className="space-y-6">
              {/* User Info Section */}
              <div className="space-y-3">
                <SectionTitle>Información personal</SectionTitle>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="w-full bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nombre de usuario</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ingresa tu nombre"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Button className="w-full" onClick={save}>
                  Guardar cambios
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={logout}
                >
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  )
}

const IconButton = tw.button`p-1 rounded hover:bg-muted md:hidden cursor-pointer`
const ModalOverlay = tw.div`fixed inset-0 bg-black/50 z-50 flex items-center justify-center md:hidden`
const ModalContent = tw.div`bg-white dark:bg-background p-6 rounded-xl shadow-xl w-[350px] max-w-[90vw]`
const ModalHeader = tw.div`flex justify-between items-center mb-6 pb-3 border-b border-border`
const CloseButton = tw.button`
  text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer
`
const SectionTitle = tw.h3`
  text-sm font-semibold text-foreground mb-2
`
