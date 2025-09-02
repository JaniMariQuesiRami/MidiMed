'use client'

import { useState, useEffect, useContext } from 'react'
import { UserContext } from '@/contexts/UserContext'
import PlanPill from '@/components/PlanPill'
import ContactUsModal from '@/components/ContactUsModal'
import PaymentConfirmationModal from '@/components/PaymentConfirmationModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import tw from 'tailwind-styled-components'
import { addDays, parseISO } from 'date-fns'
import { getTranslatedPlanName, getTranslatedStatus } from '@/utils/planTranslations'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { functions, db } from '@/lib/firebase'
import { 
  Calendar, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Users,
  FileText,
  BarChart3,
  Shield,
  HeadphonesIcon,
  Sparkles,
  Zap,
  Crown,
  TestTube,
  Briefcase,
  Stethoscope,
  ArrowRight,
  Check
} from 'lucide-react'
import type { PlanCatalog } from '@/types/db'
import type { Currency } from '@/types/recurrente'
import { toast } from 'sonner'

const TZ = 'America/Guatemala'

function formatDate(date: Date) {
  return date.toLocaleString('es-GT', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' })
}

export default function PlanManagement() {
  const { tenant, user } = useContext(UserContext)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<string | null>(null)
  const [plans, setPlans] = useState<(PlanCatalog & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [currency, setCurrency] = useState<Currency>('GTQ')

  useEffect(() => {
    loadAvailablePlans()
  }, [])

  const loadAvailablePlans = async () => {
    try {
      const planCatalogRef = collection(db, 'planCatalog')
      const snapshot = await getDocs(
        query(planCatalogRef, where('active', '==', true))
      )
      
      const availablePlans = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (PlanCatalog & { id: string })[]
      
      // Sort plans: Trial first, then by price
      const sortedPlans = availablePlans.sort((a, b) => {
        if (a.plan === 'TRIAL') return -1
        if (b.plan === 'TRIAL') return 1
        return a.price - b.price
      })
      
      setPlans(sortedPlans)
    } catch (error) {
      console.error('Error loading plans:', error)
      toast.error('Error al cargar los planes disponibles')
    } finally {
      setLoading(false)
    }
  }

  const handlePlanSelection = (planId: string) => {
    if (!user || !tenant) {
      toast.error('Error de autenticación')
      return
    }

    setSelectedPlanForPayment(planId)
    setPaymentModalOpen(true)
  }

  const handlePaymentConfirmation = async () => {
    if (!user || !tenant || !selectedPlanForPayment) {
      toast.error('Error de autenticación')
      return
    }

    setProcessingPlan(selectedPlanForPayment)
    
    try {
      const createInvoice = httpsCallable(functions, 'createMonthlyInvoice')
      const result = await createInvoice({
        userId: user.uid,
        tenantId: tenant.tenantId,
        planCatalogId: selectedPlanForPayment
      })

      // Redirect to Recurrente checkout
      if (result.data && typeof result.data === 'object' && 'url' in result.data) {
        window.location.href = result.data.url as string
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Error al procesar el pago. Por favor intenta de nuevo.')
    } finally {
      setProcessingPlan(null)
      setPaymentModalOpen(false)
      setSelectedPlanForPayment(null)
    }
  }

  const formatPrice = (centavos: number, planCurrency: Currency) => {
    const amount = centavos / 100
    if (currency !== planCurrency) {
      // Convert if currencies don't match
      const rate = currency === 'GTQ' ? 7.8 : (1 / 7.8)
      const convertedAmount = amount * rate
      return new Intl.NumberFormat('es-GT', {
        style: 'currency',
        currency: currency
      }).format(convertedAmount)
    }
    return new Intl.NumberFormat('es-GT', {
      style: 'currency', 
      currency: planCurrency
    }).format(amount)
  }

  const getPlanFeatures = (planType: string) => {
    const features = {
      TRIAL: [
        { text: 'Acceso completo por 30 días', icon: CheckCircle2 },
        { text: 'Hasta 20 pacientes', icon: Users },
        { text: 'Agenda digital con recordatorios', icon: Calendar },
        { text: 'Expedientes médicos digitales', icon: FileText },
        { text: 'Resúmenes automáticos con IA', icon: Sparkles }
      ],
      BASIC: [
        { text: 'Hasta 100 pacientes', icon: Users },
        { text: 'Agenda digital completa', icon: Calendar },
        { text: 'Expedientes médicos digitales', icon: FileText },
        { text: 'Resúmenes automáticos con IA', icon: Sparkles },
        { text: 'Reportes básicos', icon: BarChart3 },
        { text: 'Soporte por email', icon: HeadphonesIcon }
      ],
      PRO: [
        { text: 'Pacientes ilimitados', icon: Users },
        { text: 'Todas las funciones del plan Básico', icon: Check },
        { text: 'Reportes personalizados y análisis', icon: BarChart3 },
        { text: 'Plantillas digitales para recetas', icon: FileText },
        { text: 'Integraciones API', icon: Zap },
        { text: 'Soporte prioritario en vivo', icon: Shield }
      ],
      ENTERPRISE: [
        { text: 'Todo del plan Pro incluido', icon: Crown },
        { text: 'Soporte dedicado 24/7', icon: Shield },
        { text: 'Configuración personalizada', icon: Sparkles },
        { text: 'Integración con sistemas existentes', icon: Zap },
        { text: 'Capacitación especializada', icon: TrendingUp },
        { text: 'SLA garantizado', icon: CheckCircle2 }
      ]
    }
    return features[planType as keyof typeof features] || []
  }

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'TRIAL': return TestTube
      case 'BASIC': return Briefcase  
      case 'PRO': return Stethoscope
      case 'ENTERPRISE': return Crown
      default: return Briefcase
    }
  }

  const isCurrentPlan = (planType: string) => {
    return tenant?.billing?.plan === planType
  }

  const canUpgradeTo = (planType: string) => {
    const currentPlan = tenant?.billing?.plan
    const planOrder = ['TRIAL', 'BASIC', 'PRO', 'ENTERPRISE']
    const currentIndex = planOrder.indexOf(currentPlan || 'TRIAL')
    const targetIndex = planOrder.indexOf(planType)
    return targetIndex > currentIndex
  }

  if (!tenant?.billing) return null

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
      {/* Current Plan Section */}
      <Section>
        <SectionTitle>Plan Actual</SectionTitle>
        
        <CurrentPlanCard>
          <PlanHeader>
            <div className="flex items-center gap-3">
              <PlanIcon>
                <TrendingUp size={20} />
              </PlanIcon>
              <div>
                <PlanName>Plan {getTranslatedPlanName(billing.plan)}</PlanName>
              </div>
            </div>
            <PlanPill billing={billing} onClick={() => setContactModalOpen(true)} />
          </PlanHeader>

          {/* Plan Details within the same card */}
          {(trialStart || remaining || purchasedAt || paidThrough || billing.status) && (
            <PlanDetailsGrid>
              <PlanDetailItem>
                <PlanDetailIcon>
                  {(billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE') ? 
                    <CheckCircle2 size={14} /> : 
                    <AlertCircle size={14} />
                  }
                </PlanDetailIcon>
                <div>
                  <PlanDetailLabel>Estado del Plan</PlanDetailLabel>
                  <PlanDetailValue $highlight={billing.status === 'TRIAL_ACTIVE' || billing.status === 'PAID_ACTIVE'}>
                    {getTranslatedStatus(billing.status)}
                  </PlanDetailValue>
                </div>
              </PlanDetailItem>

              {trialStart && trialEnd && (
                <PlanDetailItem>
                  <PlanDetailIcon>
                    <Calendar size={14} />
                  </PlanDetailIcon>
                  <div>
                    <PlanDetailLabel>Período de Prueba</PlanDetailLabel>
                    <PlanDetailValue>
                      {formatDate(trialStart)} - {formatDate(trialEnd)}
                    </PlanDetailValue>
                  </div>
                </PlanDetailItem>
              )}

              {remaining && (
                <PlanDetailItem>
                  <PlanDetailIcon>
                    <Clock size={14} />
                  </PlanDetailIcon>
                  <div>
                    <PlanDetailLabel>Tiempo Restante</PlanDetailLabel>
                    <PlanDetailValue $highlight>{remaining}</PlanDetailValue>
                  </div>
                </PlanDetailItem>
              )}

              {purchasedAt && (
                <PlanDetailItem>
                  <PlanDetailIcon>
                    <CreditCard size={14} />
                  </PlanDetailIcon>
                  <div>
                    <PlanDetailLabel>Fecha de Compra</PlanDetailLabel>
                    <PlanDetailValue>{formatDate(purchasedAt)}</PlanDetailValue>
                  </div>
                </PlanDetailItem>
              )}

              {paidThrough && (
                <PlanDetailItem>
                  <PlanDetailIcon>
                    <Calendar size={14} />
                  </PlanDetailIcon>
                  <div>
                    <PlanDetailLabel>Válido Hasta</PlanDetailLabel>
                    <PlanDetailValue>{formatDate(paidThrough)}</PlanDetailValue>
                  </div>
                </PlanDetailItem>
              )}
            </PlanDetailsGrid>
          )}
        </CurrentPlanCard>
      </Section>

      {/* Available Plans Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Planes Disponibles</SectionTitle>
          <CurrencyToggle>
            <button
              className={`px-3 py-1 rounded-l-md text-sm font-medium transition-colors ${
                currency === 'USD' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setCurrency('USD')}
            >
              USD
            </button>
            <button
              className={`px-3 py-1 rounded-r-md text-sm font-medium transition-colors ${
                currency === 'GTQ' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setCurrency('GTQ')}
            >
              GTQ
            </button>
          </CurrencyToggle>
        </SectionHeader>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        ) : (
          <PlansGrid>
            {plans.map((plan) => {
              const PlanIconComponent = getPlanIcon(plan.plan)
              const features = getPlanFeatures(plan.plan)
              const isCurrent = isCurrentPlan(plan.plan)
              const canUpgrade = canUpgradeTo(plan.plan)
              const isPro = plan.plan === 'PRO'
              const isEnterprise = plan.plan === 'ENTERPRISE'
              const isProcessing = processingPlan === plan.id

              return (
                <PlanCard 
                  key={plan.id} 
                  $current={isCurrent}
                  $popular={isPro}
                  $enterprise={isEnterprise}
                >
                  {isPro && (
                    <PopularBadge>
                      <Crown className="w-4 h-4 mr-1" />
                      Más Popular
                    </PopularBadge>
                  )}
                  {isCurrent && (
                    <CurrentBadge>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Plan Actual
                    </CurrentBadge>
                  )}

                  <PlanCardHeader>
                    <PlanCardIcon $pro={isPro} $enterprise={isEnterprise}>
                      <PlanIconComponent className="w-8 h-8" />
                    </PlanCardIcon>
                    <PlanCardTitle $pro={isPro} $enterprise={isEnterprise}>
                      {plan.productName || plan.plan}
                    </PlanCardTitle>
                    <PlanPricing>
                      <PriceAmount $pro={isPro} $enterprise={isEnterprise}>
                        {plan.plan === 'TRIAL' ? 'Gratis' : formatPrice(plan.price, plan.currency)}
                      </PriceAmount>
                      <PricePeriod $pro={isPro} $enterprise={isEnterprise}>
                        {plan.plan === 'TRIAL' ? 'por 30 días' : '/mes'}
                      </PricePeriod>
                    </PlanPricing>
                  </PlanCardHeader>

                  <FeaturesList>
                    {features.map((feature, idx) => {
                      const FeatureIcon = feature.icon
                      return (
                        <FeatureItem key={idx}>
                          <FeatureIcon className={`w-4 h-4 flex-shrink-0 ${
                            isEnterprise ? 'text-white' : 'text-primary'
                          }`} />
                          <FeatureText $pro={isPro} $enterprise={isEnterprise}>
                            {feature.text}
                          </FeatureText>
                        </FeatureItem>
                      )
                    })}
                  </FeaturesList>

                  <PlanCardFooter>
                    {isCurrent ? (
                      <CurrentPlanButton disabled>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Plan Actual
                      </CurrentPlanButton>
                    ) : canUpgrade ? (
                      <UpgradeButton
                        disabled={isProcessing}
                        onClick={() => handlePlanSelection(plan.id)}
                        $pro={isPro}
                        $enterprise={isEnterprise}
                      >
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <span className={isProcessing ? 'opacity-0' : 'flex items-center'}>
                          Actualizar Plan
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      </UpgradeButton>
                    ) : (
                      <ContactButton onClick={() => setContactModalOpen(true)}>
                        Contáctanos
                      </ContactButton>
                    )}
                  </PlanCardFooter>
                </PlanCard>
              )
            })}
          </PlansGrid>
        )}
      </Section>

      <PaymentConfirmationModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false)
          setSelectedPlanForPayment(null)
        }}
        onConfirm={handlePaymentConfirmation}
        email={tenant?.email || ''}
        planName={selectedPlanForPayment ? getTranslatedPlanName(plans.find(p => p.id === selectedPlanForPayment)?.plan || 'BASIC') : ''}
        isProcessing={!!processingPlan}
      />

      <ContactUsModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
    </Container>
  )
}

// Styled Components
const Container = tw.div`space-y-8 px-2 sm:px-4 pt-6 pb-6`

const Section = tw.div`space-y-6`
const SectionHeader = tw.div`flex items-center justify-between`
const SectionTitle = tw.h2`text-xl font-semibold text-foreground`

const CurrencyToggle = tw.div`flex border rounded-md overflow-hidden`

const LoadingContainer = tw.div`flex justify-center items-center py-12`

// Current Plan Styles
const CurrentPlanCard = tw.div`bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm`
const PlanHeader = tw.div`flex items-center justify-between`
const PlanIcon = tw.div`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary`
const PlanName = tw.h3`text-lg font-semibold text-foreground`

// Plans Grid Styles
const PlansGrid = tw.div`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

interface PlanCardProps {
  $current?: boolean
  $popular?: boolean
  $enterprise?: boolean
}

const PlanCard = tw.div<PlanCardProps>`
  relative bg-card border rounded-xl p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-200
  ${(p) => p.$current ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/30'}
  ${(p) => p.$popular ? 'bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/50 dark:to-cyan-950/50' : ''}
  ${(p) => p.$enterprise ? 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50' : ''}
`

const PopularBadge = tw.div`
  absolute -top-3 left-1/2 transform -translate-x-1/2 z-10
  bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-3 py-1 rounded-full
  text-xs font-semibold flex items-center shadow-lg
`

const CurrentBadge = tw.div`
  absolute -top-3 left-1/2 transform -translate-x-1/2 z-10
  bg-primary text-primary-foreground px-3 py-1 rounded-full
  text-xs font-semibold flex items-center shadow-lg
`

const PlanCardHeader = tw.div`text-center space-y-4`

interface PlanCardIconProps {
  $pro?: boolean
  $enterprise?: boolean
}

const PlanCardIcon = tw.div<PlanCardIconProps>`
  w-16 h-16 rounded-full mx-auto flex items-center justify-center
  ${(p) => p.$pro ? 'bg-gradient-to-br from-sky-400 to-cyan-500 text-white' : 
    p.$enterprise ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white' : 
    'bg-primary/10 text-primary'}
`

interface PlanCardTitleProps {
  $pro?: boolean
  $enterprise?: boolean
}

const PlanCardTitle = tw.h3<PlanCardTitleProps>`
  text-xl font-bold
  ${(p) => p.$pro || p.$enterprise ? 'text-primary' : 'text-foreground'}
`

const PlanPricing = tw.div`space-y-1`

const PriceAmount = tw.div<PlanCardTitleProps>`
  text-3xl font-bold
  ${(p) => p.$pro || p.$enterprise ? 'text-primary' : 'text-foreground'}
`

const PricePeriod = tw.div<PlanCardTitleProps>`
  text-sm
  ${(p) => p.$pro || p.$enterprise ? 'text-muted-foreground/80' : 'text-muted-foreground'}
`

const FeaturesList = tw.ul`space-y-3`
const FeatureItem = tw.li`flex items-start gap-3`

const FeatureText = tw.span<PlanCardTitleProps>`
  text-sm
  ${(p) => p.$pro || p.$enterprise ? 'text-foreground' : 'text-foreground'}
`

const PlanCardFooter = tw.div`pt-4 border-t border-border`

const CurrentPlanButton = tw.button`
  w-full h-12 py-3 px-4 bg-muted text-muted-foreground rounded-lg font-medium cursor-not-allowed
  flex items-center justify-center
`

interface UpgradeButtonProps {
  $pro?: boolean
  $enterprise?: boolean
}

const UpgradeButton = tw.button<UpgradeButtonProps>`
  relative w-full h-12 py-3 px-4 rounded-lg font-medium transition-colors
  flex items-center justify-center
  ${(p) => p.$pro ? 'bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white' :
    p.$enterprise ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white' :
    'bg-primary hover:bg-primary/90 text-primary-foreground'}
  disabled:opacity-50 disabled:cursor-not-allowed
`

const ContactButton = tw.button`
  w-full h-12 py-3 px-4 border border-border text-foreground rounded-lg font-medium
  hover:bg-muted transition-colors
`

// Plan Details Grid (within current plan card)
const PlanDetailsGrid = tw.div`grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4`
const PlanDetailItem = tw.div`flex items-center gap-2 p-2 bg-muted/30 rounded-lg`
const PlanDetailIcon = tw.div`w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0`
const PlanDetailLabel = tw.p`text-xs font-medium text-muted-foreground`

interface PlanDetailValueProps {
  $highlight?: boolean
}

const PlanDetailValue = tw.p<PlanDetailValueProps>`
  text-xs font-semibold
  ${(p) => p.$highlight ? 'text-primary' : 'text-foreground'}
`
