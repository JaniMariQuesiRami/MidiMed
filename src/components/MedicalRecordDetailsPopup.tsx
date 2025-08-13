'use client'

import { useContext, useMemo } from 'react'
import { UserContext } from '@/contexts/UserContext'
import type { MedicalRecord } from '@/types/db'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function MedicalRecordDetailsPopup({
  record,
  onClose,
  onEdit,
}: {
  record: MedicalRecord | null
  onClose: () => void
  onEdit?: (r: MedicalRecord) => void
}) {
  const { tenant } = useContext(UserContext)
  const extraDefs = useMemo(() => tenant?.settings?.extraFields?.filter(f => f.collection === 'medicalRecords') || [], [tenant])

  return (
    <Dialog open={!!record} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalle de registro</DialogTitle>
        </DialogHeader>
        {record && (
          <div className="space-y-2">
            <p><span className="font-medium">Resumen:</span> {record.summary}</p>
            {record.details.diagnosis && (
              <p><span className="font-medium">Diagnóstico:</span> {record.details.diagnosis}</p>
            )}
            {record.details.notes && (
              <p><span className="font-medium">Notas:</span> {record.details.notes}</p>
            )}
            {extraDefs.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-1">Campos adicionales</p>
                <ul className="text-sm space-y-1">
                  {extraDefs.map(def => (
                    <li key={def.key}>
                      <span className="font-medium">{def.label}:</span>{' '}
                      {formatValue(record.extras?.[def.key], def.type)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {onEdit && (
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => onEdit(record)}>Editar</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function formatValue(value: unknown, type: string) {
  if (value === undefined || value === null || value === '') return '-'
  if (type === 'date') {
    try {
      return new Date(value as string | number | Date).toLocaleDateString()
    } catch {
      return String(value)
    }
  }
  return String(value)
}
