'use client'

import { useContext, useMemo } from 'react'
import { UserContext } from '@/contexts/UserContext'
import type { MedicalRecord, ExtraFieldDef, ExtraFieldType } from '@/types/db'
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
  
  // Get extra field definitions - reconstruct from saved data to preserve historical fields
  const extraDefs = useMemo<ExtraFieldDef[]>(() => {
    const currentOrgExtraFields = tenant?.settings?.extraFields?.filter(f => f.collection === 'medicalRecords') || []
    
    // If we have a record with extras, reconstruct extra field definitions from the saved data
    if (record?.extras) {
      const savedExtraFields: ExtraFieldDef[] = []
      
      // Add fields that exist in the saved record
      Object.entries(record.extras).forEach(([key, value]) => {
        // Try to determine the type from the saved value
        let type: ExtraFieldType = 'text'
        if (typeof value === 'boolean') {
          type = 'bool'
        } else if (typeof value === 'number') {
          type = 'number'
        } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
          type = 'date'
        }
        
        // Check if this field exists in current org settings to get proper label
        const currentField = currentOrgExtraFields.find(f => f.key === key)
        
        savedExtraFields.push({
          key,
          label: currentField?.label || key, // Use current label if available, fallback to key
          type: currentField?.type || type, // Prefer current type if available
          collection: 'medicalRecords'
        })
      })
      
      // Also add any new fields from current org settings that aren't in the saved record
      currentOrgExtraFields.forEach(currentField => {
        if (!savedExtraFields.some(f => f.key === currentField.key)) {
          savedExtraFields.push(currentField)
        }
      })
      
      return savedExtraFields
    }
    
    // For records without extras, use current organization settings
    return currentOrgExtraFields
  }, [tenant, record])

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
            {extraDefs.some(def => record.extras?.[def.key] !== undefined && record.extras?.[def.key] !== null && record.extras?.[def.key] !== '') && (
              <div className="mt-4">
                <p className="font-medium mb-1">Campos adicionales</p>
                <ul className="text-sm space-y-1">
                  {extraDefs
                    .filter(def => record.extras?.[def.key] !== undefined && record.extras?.[def.key] !== null && record.extras?.[def.key] !== '')
                    .map(def => (
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
