'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { User as UserIcon, X } from 'lucide-react'
import { UserContext } from '@/contexts/UserContext'
import { Input } from '@/components/ui/input'
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
              <span>Configuración</span>
              <CloseButton onClick={() => setOpen(false)}>
                <X size={18} />
              </CloseButton>
            </ModalHeader>
            <div className="space-y-3">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nombre"
              />
              <Button className="w-full" onClick={save}>
                Guardar
              </Button>
              <DangerButton onClick={logout}>Logout</DangerButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  )
}

const IconButton = tw.button`p-1 rounded hover:bg-muted md:hidden`
const ModalOverlay = tw.div`fixed inset-0 bg-black/50 z-50 flex items-center justify-center md:hidden`
const ModalContent = tw.div`bg-white dark:bg-background p-6 rounded-lg shadow-lg w-[300px]`
const ModalHeader = tw.div`flex justify-between items-center mb-4 text-lg font-medium`
const CloseButton = tw.button`text-muted-foreground hover:text-foreground`
const DangerButton = tw.button`w-full mt-2 px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20`
