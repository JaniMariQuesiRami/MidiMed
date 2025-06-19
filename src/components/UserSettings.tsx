'use client'

import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { User as UserIcon, X } from 'lucide-react'
import tw from 'tailwind-styled-components'

export default function UserSettings({ collapsed }: { collapsed: boolean }) {
  const { user, tenant, logout } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

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
              <span>Settings</span>
              <CloseButton onClick={() => setOpen(false)}><X size={18} /></CloseButton>
            </ModalHeader>
            <DangerButton onClick={logout}>Logout</DangerButton>
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
  bg-white dark:bg-background p-6 rounded-lg shadow-lg w-[300px]
`
const ModalHeader = tw.div`
  flex justify-between items-center mb-4 text-lg font-medium
`
const CloseButton = tw.button`text-muted-foreground hover:text-foreground`
const DangerButton = tw.button`
  w-full mt-2 px-4 py-2 text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20
`
