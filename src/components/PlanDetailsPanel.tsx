'use client'

import { useContext, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import PlanPill from '@/components/PlanPill'
import ContactUsModal from '@/components/ContactUsModal'
import tw from 'tailwind-styled-components'
import { addDays, parseISO } from 'date-fns'
import { getTranslatedPlanName, getTranslatedStatus } from '@/utils/planTranslations'
import { Calendar, Clock, CreditCard, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

const TZ = 'America/Guatemala'

function formatDate(date: Date) {
  return date.toLocaleString('es-GT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export default function PlanDetailsPanel() {
  const { tenant } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  if (!tenant) return null

  const { billing } = tenant
  const trialStart = billing.trialStartAt ? parseISO(billing.trialStartAt) : null
  const trialEnd = billing.trialStartAt
    ? addDays(parseISO(billing.trialStartAt), billing.trialDays ?? 15)
    : null
  const purchasedAt = billing.purchasedAt ? parseISO(billing.purchasedAt) : null
  const paidThrough = billing.paidThrough ? parseISO(billing.paidThrough) : null

  const remaining = (() => {
    if (billing.status === 'TRIAL_ACTIVE' && trialEnd) {
      const diffMs = trialEnd.getTime() - new Date().getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
        const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))
        return `${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
      }
    }
    if (billing.status === 'PAID_ACTIVE' && paidThrough) {
      const diffMs = paidThrough.getTime() - new Date().getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        return `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
      }
    }
    return null
  })()

  return (
    <Container>
      <Header>
        <HeaderSubtitle>Información sobre tu suscripción actual</HeaderSubtitle>
      </Header>

      <PlanCard>
        <PlanHeader>
          <div className="flex items-center gap-3">
            <PlanIcon>
              <TrendingUp size={20} />
            </PlanIcon>
            <div>
              <PlanName>Plan {getTranslatedPlanName(billing.plan)}</PlanName>
              <PlanSubtext>Tu plan actual</PlanSubtext>
            </div>
          </div>
          <PlanPill billing={billing} onClick={() => setOpen(true)} />
        </PlanHeader>

        <StatusCard $isActive={billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE'}>
          <StatusIcon $isActive={billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE'}>
            {(billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE') ? 
              <CheckCircle2 size={18} /> : 
              <AlertCircle size={18} />
            }
          </StatusIcon>
          <StatusContent>
            <StatusTitle>Estado del Plan</StatusTitle>
            <StatusValue $isActive={billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE'}>
              {getTranslatedStatus(billing.status)}
            </StatusValue>
          </StatusContent>
        </StatusCard>
      </PlanCard>

      <DetailsGrid>
        {trialStart && trialEnd && (
          <DetailCard>
            <DetailIcon>
              <Calendar size={18} />
            </DetailIcon>
            <DetailContent>
              <DetailLabel>Período de Prueba</DetailLabel>
              <DetailValue>
                {formatDate(trialStart)} - {formatDate(trialEnd)}
              </DetailValue>
            </DetailContent>
          </DetailCard>
        )}

        {remaining && (
          <DetailCard>
            <DetailIcon>
              <Clock size={18} />
            </DetailIcon>
            <DetailContent>
              <DetailLabel>Tiempo Restante</DetailLabel>
              <DetailValue $highlight>{remaining}</DetailValue>
            </DetailContent>
          </DetailCard>
        )}

        {purchasedAt && (
          <DetailCard>
            <DetailIcon>
              <CreditCard size={18} />
            </DetailIcon>
            <DetailContent>
              <DetailLabel>Fecha de Compra</DetailLabel>
              <DetailValue>{formatDate(purchasedAt)}</DetailValue>
            </DetailContent>
          </DetailCard>
        )}

        {paidThrough && (
          <DetailCard>
            <DetailIcon>
              <Calendar size={18} />
            </DetailIcon>
            <DetailContent>
              <DetailLabel>Válido Hasta</DetailLabel>
              <DetailValue>{formatDate(paidThrough)}</DetailValue>
            </DetailContent>
          </DetailCard>
        )}
      </DetailsGrid>

      <ActionSection>
        <ContactButton onClick={() => setOpen(true)}>
          <TrendingUp size={16} />
          Solicitar Mejora de Plan
        </ContactButton>
        <ContactSubtext>
          Nuestro equipo de ventas te contactará para ofrecerte el plan perfecto para tus necesidades
        </ContactSubtext>
      </ActionSection>

      <ContactUsModal open={open} onOpenChange={setOpen} />
    </Container>
  )
}

const Container = tw.div`space-y-6 px-2 sm:px-4 pt-6 pb-6`

const Header = tw.div`text-center space-y-2`
const HeaderSubtitle = tw.p`text-sm text-muted-foreground`

const PlanCard = tw.div`bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm`
const PlanHeader = tw.div`flex items-center justify-between`

const PlanIcon = tw.div`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary`
const PlanName = tw.h3`text-lg font-semibold text-foreground`
const PlanSubtext = tw.p`text-sm text-muted-foreground`

interface StatusCardProps {
  $isActive: boolean
}

const StatusCard = tw.div<StatusCardProps>`
  flex items-center gap-3 p-4 rounded-lg border 
  ${(p) => p.$isActive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'}
`

const StatusIcon = tw.div<StatusCardProps>`
  w-8 h-8 rounded-full flex items-center justify-center
  ${(p) => p.$isActive ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-300'}
`

const StatusContent = tw.div`flex-1`
const StatusTitle = tw.p`text-sm font-medium text-muted-foreground`

interface StatusValueProps {
  $isActive: boolean
}

const StatusValue = tw.p<StatusValueProps>`
  text-sm font-semibold
  ${(p) => p.$isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
`

const DetailsGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 gap-4`

const DetailCard = tw.div`bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow`
const DetailIcon = tw.div`w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary`
const DetailContent = tw.div`space-y-1`
const DetailLabel = tw.p`text-xs font-medium text-muted-foreground uppercase tracking-wider`

interface DetailValueProps {
  $highlight?: boolean
}

const DetailValue = tw.p<DetailValueProps>`
  text-sm font-semibold
  ${(p) => p.$highlight ? 'text-primary' : 'text-foreground'}
`

const ActionSection = tw.div`text-center space-y-3`
const ContactButton = tw.button`
  inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg 
  hover:bg-primary/90 font-medium transition-colors shadow-sm hover:shadow-md
`
const ContactSubtext = tw.p`text-sm text-muted-foreground max-w-md mx-auto`
