'use client'

import { useContext } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { User as UserIcon } from 'lucide-react'
import PlanPill from './PlanPill'
import tw from 'tailwind-styled-components'

export default function UserPlanCard({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const { user, tenant } = useContext(UserContext)
  if (!user || !tenant) return null

  return (
    <CardWrapper onClick={onClick}>
      {collapsed ? (
        <CollapsedCard>
          <UserIcon size={20} />
        </CollapsedCard>
      ) : (
        <FullCard>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserIcon size={18} />
              <div>
                <TenantName>{tenant.name}</TenantName>
                <UserEmail>{user.email}</UserEmail>
              </div>
            </div>
            <PlanPill billing={tenant.billing} />
          </div>
        </FullCard>
      )}
    </CardWrapper>
  )
}

const CardWrapper = tw.div`cursor-pointer`
const FullCard = tw.div`mt-4 p-4 rounded-md border bg-muted`
const CollapsedCard = tw.div`mt-4 p-3 rounded-md border bg-muted flex justify-center text-muted-foreground`
const TenantName = tw.p`text-sm font-semibold`
const UserEmail = tw.p`text-xs text-muted-foreground`
