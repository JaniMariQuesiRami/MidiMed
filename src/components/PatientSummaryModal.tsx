'use client'

import { Sparkles, X } from 'lucide-react'
import tw from 'tailwind-styled-components'

export default function PatientSummaryModal({
  open,
  onClose,
  patientSummary,
  patientName,
}: {
  open: boolean
  onClose: () => void
  patientSummary?: string
  patientName?: string
}) {
  if (!open) return null

  return (
    <Overlay onClick={onClose}>
      <PopupCard onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-lg">AI Insight - {patientName}</span>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted text-muted-foreground focus:outline-none">
            <X size={18} />
          </button>
        </div>
        <ContentWrapper>
          {patientSummary ? (
            <SummaryText>{patientSummary}</SummaryText>
          ) : (
            <EmptyState>
              <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                No hay resumen disponible para este paciente.
              </p>
            </EmptyState>
          )}
        </ContentWrapper>
      </PopupCard>
    </Overlay>
  )
}

const Overlay = tw.div`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4`

const PopupCard = tw.div`
  bg-white dark:bg-background rounded-xl p-6 shadow-2xl w-full max-w-md
  border border-border
  animate-fadeIn
  max-h-[90dvh] overflow-y-auto
`

const ContentWrapper = tw.div`
  max-h-[60vh] overflow-y-auto
`

const SummaryText = tw.div`
  text-sm leading-relaxed text-foreground
  whitespace-pre-wrap
  p-4 bg-muted/30 rounded-lg
  border border-border
`

const EmptyState = tw.div`
  flex flex-col items-center justify-center text-center py-8
`
