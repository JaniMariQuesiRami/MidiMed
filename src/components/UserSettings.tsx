'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { User as UserIcon, X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { auth, db } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import tw from 'tailwind-styled-components'

export default function UserSettings({ collapsed }: { collapsed: boolean }) {
  const { user, tenant, logout } = useContext(UserContext)
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState('')

  const save = async () => {
    if (!user) return
    await updateProfile(auth.currentUser!, { displayName })
    await updateDoc(doc(db, 'users', user.uid), { displayName })
  }

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

  useEffect(() => {
    if (user) setDisplayName(user.displayName)
  }, [user])

  if (!user || !tenant) return null

  return (
    <>
      <CardWrapper onClick={() => setOpen(true)}>
        {collapsed ? (
          <CollapsedCard>
            <UserIcon size={20} />
          </CollapsedCard>
        ) : (
          <FullCard>
            <div className="flex items-center gap-2">
              <UserIcon size={18} />
              <div>
                <TenantName>{tenant.name}</TenantName>
                <UserEmail>{user.email}</UserEmail>
              </div>
            </div>
          </FullCard>
        )}
      </CardWrapper>

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

              {/* Appearance Section */}
              <div className="space-y-3">
                <SectionTitle>Apariencia</SectionTitle>
                <ToggleRow>
                  <div className="flex-1">
                    <ToggleLabel>Modo oscuro</ToggleLabel>
                    <ToggleDescription>Cambiar entre tema claro y oscuro</ToggleDescription>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </ToggleRow>
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

// styles
const CardWrapper = tw.div`cursor-pointer`
const FullCard = tw.div`mt-4 p-4 rounded-md border bg-muted`
const CollapsedCard = tw.div`mt-4 p-3 rounded-md border bg-muted flex justify-center text-muted-foreground`
const TenantName = tw.p`text-sm font-semibold`
const UserEmail = tw.p`text-xs text-muted-foreground`

const ModalOverlay = tw.div`
  fixed inset-0 bg-black/50 z-50 flex items-center justify-center
`
const ModalContent = tw.div`
  bg-white dark:bg-background p-6 rounded-xl shadow-xl w-[400px] max-w-[90vw]
`
const ModalHeader = tw.div`
  flex justify-between items-center mb-6 pb-3 border-b border-border
`
const CloseButton = tw.button`
  text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted cursor-pointer
`
const SectionTitle = tw.h3`
  text-sm font-semibold text-foreground mb-2
`
const ToggleRow = tw.div`
  flex items-center justify-between py-2
`
const ToggleLabel = tw.div`
  text-sm font-medium text-foreground
`
const ToggleDescription = tw.div`
  text-xs text-muted-foreground mt-1
`
