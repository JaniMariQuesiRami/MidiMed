'use client'

import { useContext } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { User as UserIcon } from 'lucide-react'
import PlanPill from './PlanPill'
import tw from 'tailwind-styled-components'
import { useRouter } from 'next/navigation'

export default function UserPlanCard({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const { user, tenant } = useContext(UserContext)
  const router = useRouter()
  if (!user || !tenant) return null

  const handlePlanClick = () => {
    router.push('/settings?tab=plan')
  }

  return (
    <CardWrapper>
      {collapsed ? (
        <CollapsedCard onClick={onClick}>
          <UserIcon size={20} />
        </CollapsedCard>
      ) : (
        <FullCard>
          <CardContent>
            <UserSection onClick={onClick}>
              <UserIcon size={18} />
              <UserInfo>
                <TenantName>{tenant.name}</TenantName>
                <UserEmail>{user.email}</UserEmail>
              </UserInfo>
            </UserSection>
            <PlanSection>
              <PlanPill billing={tenant.billing} onClick={handlePlanClick} />
            </PlanSection>
          </CardContent>
        </FullCard>
      )}
    </CardWrapper>
  )
}

const CardWrapper = tw.div`transition-all duration-200`
const FullCard = tw.div`mt-4 p-4 rounded-lg border bg-muted transition-all`
const CollapsedCard = tw.div`mt-4 p-3 rounded-lg border bg-muted hover:bg-muted/80 hover:shadow-sm flex justify-center text-muted-foreground transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]`

const CardContent = tw.div`flex items-center justify-between gap-2`
const UserSection = tw.div`flex items-center gap-2 flex-1 hover:bg-muted/50 rounded-md p-2 -m-2 transition-colors cursor-pointer hover:scale-[1.01] active:scale-[0.99]`
const UserInfo = tw.div`space-y-0.5`
const PlanSection = tw.div`flex-shrink-0`

const TenantName = tw.p`text-sm font-semibold`
const UserEmail = tw.p`text-xs text-muted-foreground`
