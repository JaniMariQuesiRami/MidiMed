'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { TenantBilling } from '@/types/db'
import { addDays, parseISO } from 'date-fns'
import { getTranslatedPlanName, getTranslatedStatus } from '@/utils/planTranslations'
import { Calendar, Clock, CreditCard, AlertTriangle, CheckCircle2, Crown } from 'lucide-react'
import tw from 'tailwind-styled-components'

const TZ = 'America/Guatemala'

function formatDate(date: Date) {
  return date.toLocaleString('es-GT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export default function PlanPill({ billing, onClick }: { billing?: TenantBilling; onClick?: () => void }) {
  if (!billing) return null

  const colors: Record<string, string> = {
    TRIAL: 'bg-yellow-200 text-yellow-800',
    BASIC: 'bg-blue-200 text-blue-800',
    PRO: 'bg-purple-200 text-purple-800',
    ENTERPRISE: 'bg-green-200 text-green-800',
  }

  const body = (() => {
    const now = new Date()
    if (billing.status === 'TRIAL_ACTIVE' && billing.trialStartAt) {
      const trialEnd = addDays(parseISO(billing.trialStartAt), billing.trialDays ?? 15)
      const diffMs = trialEnd.getTime() - now.getTime()
      if (diffMs > 0) {
        const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000))
        if (diffDays > 0) {
          return `Quedan ${diffDays} ${diffDays === 1 ? 'día' : 'días'}.`
        } else {
          const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))
          return `Quedan ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}.`
        }
      }
      return 'El periodo de prueba terminó.'
    }
    if (billing.status === 'TRIAL_EXPIRED') {
      return 'El periodo de prueba terminó.'
    }
    if (billing.status === 'PAID_ACTIVE') {
      return billing.paidThrough ? `Válido hasta: ${formatDate(parseISO(billing.paidThrough))}.` : ''
    }
    if (billing.status === 'PAST_DUE') {
      return billing.paidThrough ? `Pago pendiente. Venció: ${formatDate(parseISO(billing.paidThrough))}.` : ''
    }
    return ''
  })()

  const pill = (
    <PillContainer 
      className={colors[billing.plan] ?? 'bg-gray-200 text-gray-800'}
      onClick={(e: React.MouseEvent) => {
        if (onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
    >
      {getTranslatedPlanName(billing.plan)}
    </PillContainer>
  )

  // Mostrar tooltip siempre si hay onClick o si hay body
  if (!body && !onClick) return pill

  // Determinar el icono según el estado
  const getStatusIcon = () => {
    switch (billing.status) {
      case 'TRIAL_ACTIVE':
        return <Clock size={16} />
      case 'PAID_ACTIVE':
        return <CheckCircle2 size={16} />
      case 'TRIAL_EXPIRED':
      case 'PAST_DUE':
        return <AlertTriangle size={16} />
      default:
        return <Crown size={16} />
    }
  }

  const getStatusColor = () => {
    switch (billing.status) {
      case 'TRIAL_ACTIVE':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'PAID_ACTIVE':
        return 'text-green-600 dark:text-green-400'
      case 'TRIAL_EXPIRED':
      case 'PAST_DUE':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent 
          className="max-w-xs p-0 z-[9999]" 
          sideOffset={8} 
          side="right"
          avoidCollisions={true}
          collisionPadding={10}
        >
          <TooltipCard>
            <TooltipHeader>
              <HeaderIcon className={getStatusColor()}>
                {getStatusIcon()}
              </HeaderIcon>
              <HeaderContent>
                <PlanTitle>Plan {getTranslatedPlanName(billing.plan)}</PlanTitle>
                <StatusBadge className={getStatusColor()}>
                  {getTranslatedStatus(billing.status)}
                </StatusBadge>
              </HeaderContent>
            </TooltipHeader>

            <TooltipBody>
              {body && <InfoText>{body}</InfoText>}
              
              {/* Información adicional estructurada */}
              <InfoGrid>
                {billing.trialStartAt && (
                  <InfoRow>
                    <InfoIcon>
                      <Calendar size={14} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Inicio de Prueba</InfoLabel>
                      <InfoValue>{formatDate(parseISO(billing.trialStartAt))}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                )}
                
                {billing.purchasedAt && (
                  <InfoRow>
                    <InfoIcon>
                      <CreditCard size={14} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Fecha de Compra</InfoLabel>
                      <InfoValue>{formatDate(parseISO(billing.purchasedAt))}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                )}

                {billing.paidThrough && (
                  <InfoRow>
                    <InfoIcon>
                      <Clock size={14} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Válido Hasta</InfoLabel>
                      <InfoValue>{formatDate(parseISO(billing.paidThrough))}</InfoValue>
                    </InfoContent>
                  </InfoRow>
                )}
              </InfoGrid>
            </TooltipBody>
          </TooltipCard>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Styled Components
const PillContainer = tw.span`
  inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium transition-all 
  hover:shadow-sm active:scale-95 relative
  ${(props) => props.onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-help'}
`

const TooltipCard = tw.div`bg-card border-0 shadow-lg rounded-lg overflow-hidden`
const TooltipHeader = tw.div`flex items-center gap-3 p-4 bg-muted/30`
const HeaderIcon = tw.div`w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm`
const HeaderContent = tw.div`flex-1 space-y-1`
const PlanTitle = tw.h4`text-sm font-semibold text-foreground`
const StatusBadge = tw.p`text-xs font-medium`

const TooltipBody = tw.div`p-4 space-y-3`
const InfoText = tw.p`text-sm text-muted-foreground leading-relaxed`
const InfoGrid = tw.div`space-y-2`
const InfoRow = tw.div`flex items-start gap-2`
const InfoIcon = tw.div`w-5 h-5 rounded bg-muted flex items-center justify-center text-muted-foreground mt-0.5`
const InfoContent = tw.div`flex-1 min-w-0`
const InfoLabel = tw.p`text-xs font-medium text-muted-foreground uppercase tracking-wide`
const InfoValue = tw.p`text-xs text-foreground font-medium`