'use client'

import { useState, useContext, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserContext } from '@/contexts/UserContext'
import { Check, Star } from 'lucide-react'
import tw from 'tailwind-styled-components'
import { getTranslatedPlanName } from '@/utils/planTranslations'
import { clearWantsToBuyPlan } from '@/db/billing'
import { db, functions } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { httpsCallable } from '@firebase/functions'
import { toast } from 'sonner'
import PaymentConfirmationModal from '@/components/PaymentConfirmationModal'
import type { TenantPlanType, PlanCatalog } from '@/types/db'

interface WantsToBuyModalProps {
  isOpen: boolean
  onClose: () => void
  planName: TenantPlanType
}

export default function WantsToBuyModal({ isOpen, onClose, planName }: WantsToBuyModalProps) {
  const { tenant, user } = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [planDetails, setPlanDetails] = useState<(PlanCatalog & { id: string }) | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const loadPlanDetails = useCallback(async () => {
    try {
      setLoadingPlan(true)
      const planCatalogRef = collection(db, 'planCatalog')
      const snapshot = await getDocs(
        query(
          planCatalogRef, 
          where('plan', '==', planName),
          where('active', '==', true),
          where('currency', '==', 'GTQ') // Use GTQ as default
        )
      )
      
      if (!snapshot.empty) {
        const planDoc = snapshot.docs[0]
        setPlanDetails({ id: planDoc.id, ...planDoc.data() } as PlanCatalog & { id: string })
      }
    } catch (error) {
      console.error('Error loading plan details:', error)
    } finally {
      setLoadingPlan(false)
    }
  }, [planName])

  useEffect(() => {
    if (isOpen && planName) {
      loadPlanDetails()
    }
  }, [isOpen, planName, loadPlanDetails])

  const handleActivatePlan = () => {
    if (!user || !tenant || !planDetails) {
      toast.error('Error de autenticación o plan no encontrado')
      return
    }
    
    setShowPaymentModal(true)
  }

  const handlePaymentConfirmation = async () => {
    if (!user || !tenant || !planDetails) {
      toast.error('Error de autenticación o plan no encontrado')
      return
    }

    setLoading(true)
    try {
      // Same logic as PlanManagement handlePaymentConfirmation
      const createInvoice = httpsCallable(functions, 'createMonthlyInvoice')
      const result = await createInvoice({
        userId: user.uid,
        tenantId: tenant.tenantId,
        planCatalogId: planDetails.id
      })

      // Clear the wantsToBuy flag since user is proceeding with payment
      await clearWantsToBuyPlan(tenant.tenantId)

      // Redirect to Recurrente checkout
      if (result.data && typeof result.data === 'object' && 'url' in result.data) {
        window.location.href = result.data.url as string
      } else {
        throw new Error('No se pudo obtener la URL de pago')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Error al procesar el pago. Por favor intenta de nuevo.')
      setLoading(false)
    }
  }

  const handleDismiss = async () => {
    if (tenant?.tenantId) {
      try {
        await clearWantsToBuyPlan(tenant.tenantId)
      } catch (error) {
        console.error('Error clearing wantsToBuy:', error)
      }
    }
    onClose()
  }

  const formatPrice = (priceInCentavos: number) => {
    return `Q${(priceInCentavos / 100).toFixed(2)}`
  }

  const getPlanFeatures = (plan: TenantPlanType) => {
    switch (plan) {
      case 'BASIC':
        return [
          'Agenda digital con recordatorios automáticos',
          'Expedientes médicos digitales',
          'Hasta 100 pacientes',
          'Resúmenes automáticos con IA',
          'Soporte por email',
        ]
      case 'PRO':
        return [
          'Incluye todo el plan básico + pacientes ilimitados',
          'Reportes personalizados para análisis de datos',
          'Plantillas digitales para recetas',
          'Soporte prioritario en vivo',
        ]
      default:
        return []
    }
  }

  return (
    <>
      <Dialog open={isOpen && !showPaymentModal} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            ¡Continuemos con tu plan!
          </DialogTitle>
          <DialogDescription>
            Seleccionaste el plan <strong>{getTranslatedPlanName(planName)}</strong> durante el registro.
            ¿Te gustaría activarlo ahora?
          </DialogDescription>
        </DialogHeader>

        {loadingPlan ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : planDetails ? (
          <PlanCard>
            <PlanHeader>
              <PlanName>{getTranslatedPlanName(planName)}</PlanName>
              <PlanPrice>{formatPrice(planDetails.price)}<PricePeriod>/mes</PricePeriod></PlanPrice>
            </PlanHeader>
            
            <FeaturesList>
              {getPlanFeatures(planName).map((feature, index) => (
                <Feature key={index}>
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </Feature>
              ))}
            </FeaturesList>
          </PlanCard>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No se pudo cargar la información del plan
          </div>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="flex-1"
          >
            Más tarde
          </Button>
          <Button 
            onClick={handleActivatePlan}
            disabled={loading || !planDetails}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {loading ? 'Procesando...' : 'Activar plan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <PaymentConfirmationModal
      isOpen={showPaymentModal}
      onClose={() => {
        setShowPaymentModal(false)
        // The main modal will automatically show again due to isOpen && !showPaymentModal
      }}
      onConfirm={handlePaymentConfirmation}
      email={user?.email || ''}
      planName={planDetails?.productName || getTranslatedPlanName(planName)}
      isProcessing={loading}
    />
  </>
  )
}

// Styled components
const PlanCard = tw.div`
  border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700
`

const PlanHeader = tw.div`
  text-center mb-4
`

const PlanName = tw.h3`
  text-lg font-semibold text-gray-900 dark:text-gray-100
`

const PlanPrice = tw.div`
  text-2xl font-bold text-primary dark:text-blue-400
`

const PricePeriod = tw.span`
  text-sm font-normal text-gray-600 dark:text-gray-300
`

const FeaturesList = tw.ul`
  space-y-2
`

const Feature = tw.li`
  flex items-start gap-2
`
