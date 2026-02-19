/**
 * MedicalRecordFormModal -- Modal dialog for creating/editing medical records.
 * Includes AI Medical Scribe integration (SCRIBE-005), AI-filled field indicators
 * (SCRIBE-006), and PostHog analytics events (SCRIBE-007).
 *
 * Changelog:
 * - 2026-02-19: Added AI Medical Scribe integration, field indicators, and analytics
 *               (SCRIBE-005, SCRIBE-006, SCRIBE-007)
 */

'use client'
import { useForm } from 'react-hook-form'
import { useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createMedicalRecord, updateMedicalRecord } from '@/db/patients'
import { updateAppointment, getAppointmentById } from '@/db/appointments'
import { UserContext } from '@/contexts/UserContext'
import { toast } from 'sonner'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/utils/trackEvent'
import ScribeRecorder from '@/components/ScribeRecorder'

import type { MedicalRecord, ExtraFieldDef, ExtraFieldType } from '@/types/db'
import type { ScribeFields } from '@/lib/ai/scribe-extraction'

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

const SCRIBE_ENABLED = process.env.NEXT_PUBLIC_SCRIBE_ENABLED === 'true'

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const schema = z.object({
  summary: z.string().nonempty('Resumen requerido'),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  bloodPressure: z.string().optional(),
  temperatureC: z.string().optional(),
  age: z.string().optional(),
  diagnosis: z.string().optional(),
  medications: z.string().optional(),
  followUp: z.string().optional(),
  notes: z.string().optional(),
  extras: z.record(z.any()).optional(),
})

type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MedicalRecordFormModal({
  open,
  onClose,
  patientId,
  appointmentId,
  onCreated,
  record,
  onUpdated,
}: {
  open: boolean
  onClose: () => void
  patientId: string
  appointmentId?: string | null
  patientBirthDate?: string
  onCreated?: (rec: MedicalRecord) => void
  record?: MedicalRecord | null
  onUpdated?: (rec: MedicalRecord) => void
}) {
  const { user, tenant } = useContext(UserContext)

  // ---- AI Scribe state (SCRIBE-005) ----
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set())

  // Track which AI-filled fields have already fired an edit event (SCRIBE-007)
  const reportedEditsRef = useRef<Set<string>>(new Set())

  // Track the original AI-filled count before any manual edits (SCRIBE-007)
  const originalAiFilledCountRef = useRef<number>(0)

  // Determine if the scribe should be shown
  const isNewRecord = !record
  const userCanUseScribe = user?.role === 'provider' || user?.role === 'admin'
  const showScribe = SCRIBE_ENABLED && isNewRecord && userCanUseScribe

  // Get extra field definitions - use current org settings for new records,
  // but reconstruct from saved data for existing records to preserve historical fields
  const extraDefs = useMemo<ExtraFieldDef[]>(() => {
    const currentOrgExtraFields = tenant?.settings?.extraFields?.filter(f => f.collection === 'medicalRecords') || []

    // If editing an existing record, reconstruct extra field definitions from the saved data
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

    // For new records, use current organization settings
    return currentOrgExtraFields
  }, [tenant, record])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      summary: '',
      heightCm: '',
      weightKg: '',
      bloodPressure: '',
      temperatureC: '',
      age: '',
      diagnosis: '',
      medications: '',
      followUp: '',
      notes: '',
      extras: {},
    },
  })

  useEffect(() => {
    if (open) {
      const extrasVals = extraDefs.reduce<Record<string, unknown>>((acc, def) => {
        const val = record?.extras?.[def.key]
        if (def.type === 'bool') acc[def.key] = typeof val === 'boolean' ? val : false
        else if (def.type === 'date' && typeof val === 'string') acc[def.key] = val.slice(0, 10)
        else acc[def.key] = val !== undefined && val !== null ? String(val) : ''
        return acc
      }, {})
      form.reset({
        summary: record?.summary ?? '',
        heightCm: record?.details.heightCm?.toString() ?? '',
        weightKg: record?.details.weightKg?.toString() ?? '',
        bloodPressure: record?.details.bloodPressure ?? '',
        temperatureC: record?.details.temperatureC?.toString() ?? '',
        age: record?.details.age?.toString() ?? '',
        diagnosis: record?.details.diagnosis ?? '',
        medications: record?.details.prescribedMedications?.join(', ') ?? '',
        followUp: record?.details.followUpInstructions ?? '',
        notes: record?.details.notes ?? '',
        extras: extrasVals,
      })
      // Reset AI state when dialog opens
      setAiFilledFields(new Set())
      reportedEditsRef.current = new Set()
      originalAiFilledCountRef.current = 0
    }
  }, [open, record, form, extraDefs])

  // ---- SCRIBE-005: Apply AI-extracted fields to form ----
  const applyScribeFields = useCallback(
    (fields: ScribeFields) => {
      const filledFieldNames = new Set<string>()

      // summary
      if (fields.summary != null) {
        form.setValue('summary', fields.summary)
        filledFieldNames.add('summary')
      }

      // diagnosis
      if (fields.diagnosis != null) {
        form.setValue('diagnosis', fields.diagnosis)
        filledFieldNames.add('diagnosis')
      }

      // prescribedMedications -> medications (comma-separated)
      if (fields.prescribedMedications != null && fields.prescribedMedications.length > 0) {
        form.setValue('medications', fields.prescribedMedications.join(', '))
        filledFieldNames.add('medications')
      }

      // vitals (convert numbers to strings for the form)
      if (fields.vitals.heightCm != null) {
        form.setValue('heightCm', fields.vitals.heightCm.toString())
        filledFieldNames.add('heightCm')
      }
      if (fields.vitals.weightKg != null) {
        form.setValue('weightKg', fields.vitals.weightKg.toString())
        filledFieldNames.add('weightKg')
      }
      if (fields.vitals.bloodPressure != null) {
        form.setValue('bloodPressure', fields.vitals.bloodPressure)
        filledFieldNames.add('bloodPressure')
      }
      if (fields.vitals.temperatureC != null) {
        form.setValue('temperatureC', fields.vitals.temperatureC.toString())
        filledFieldNames.add('temperatureC')
      }

      // followUpInstructions -> followUp
      if (fields.followUpInstructions != null) {
        form.setValue('followUp', fields.followUpInstructions)
        filledFieldNames.add('followUp')
      }

      // notes
      if (fields.notes != null) {
        form.setValue('notes', fields.notes)
        filledFieldNames.add('notes')
      }

      // extras (custom fields)
      if (fields.extras) {
        Object.entries(fields.extras).forEach(([key, value]) => {
          if (value != null) {
            // Find the extra field definition to handle type conversion
            const def = extraDefs.find((d) => d.key === key)
            if (def) {
              const formKey = `extras.${key}` as const
              if (def.type === 'bool') {
                form.setValue(formKey, Boolean(value))
              } else if (def.type === 'number') {
                form.setValue(formKey, String(value))
              } else if (def.type === 'date') {
                // Ensure date is in YYYY-MM-DD format for input[type=date]
                const dateStr = String(value)
                form.setValue(formKey, dateStr.slice(0, 10))
              } else {
                form.setValue(formKey, String(value))
              }
              filledFieldNames.add(`extras.${key}`)
            }
          }
        })
      }

      setAiFilledFields(filledFieldNames)
      originalAiFilledCountRef.current = filledFieldNames.size
      reportedEditsRef.current = new Set()

      toast.info('Campos llenados por IA. Revisa antes de guardar.')
    },
    [form, extraDefs]
  )

  // ---- SCRIBE-005: Clear AI-filled fields ----
  const clearScribeFields = useCallback(() => {
    aiFilledFields.forEach((fieldName) => {
      // Find matching extra field definition to determine default value
      if (fieldName.startsWith('extras.')) {
        const key = fieldName.replace('extras.', '')
        const def = extraDefs.find((d) => d.key === key)
        if (def?.type === 'bool') {
          form.setValue(fieldName as `extras.${string}`, false)
        } else {
          form.setValue(fieldName as `extras.${string}`, '')
        }
      } else {
        form.setValue(fieldName as keyof FormValues, '')
      }
    })
    setAiFilledFields(new Set())
    reportedEditsRef.current = new Set()
    originalAiFilledCountRef.current = 0

    // SCRIBE-007: Track fields cleared
    if (tenant) {
      trackEvent('scribe_fields_cleared', { tenantId: tenant.tenantId })
    }
  }, [aiFilledFields, form, extraDefs, tenant])

  // ---- SCRIBE-006: AI field indicator helpers ----

  /** Returns conditional CSS classes for an AI-filled field's FormItem. */
  const getAiFieldClasses = useCallback(
    (fieldName: string): string => {
      return aiFilledFields.has(fieldName) ? 'border-l-[3px] border-primary pl-2' : ''
    },
    [aiFilledFields]
  )

  /** Returns true if the field was filled by AI. */
  const isAiFilled = useCallback(
    (fieldName: string): boolean => {
      return aiFilledFields.has(fieldName)
    },
    [aiFilledFields]
  )

  /**
   * Wraps a field's onChange handler to remove the AI indicator on manual edit
   * and fire a one-time analytics event (SCRIBE-006 + SCRIBE-007).
   */
  const handleFieldChange = useCallback(
    (fieldName: string, originalOnChange: (...args: unknown[]) => void) => {
      return (...args: unknown[]) => {
        originalOnChange(...args)
        if (aiFilledFields.has(fieldName)) {
          setAiFilledFields((prev) => {
            const next = new Set(prev)
            next.delete(fieldName)
            return next
          })

          // SCRIBE-007: Fire edit event only once per field per session
          if (!reportedEditsRef.current.has(fieldName)) {
            reportedEditsRef.current.add(fieldName)
            if (tenant) {
              trackEvent('scribe_field_edited', {
                tenantId: tenant.tenantId,
                fieldName,
                wasAiFilled: true,
              })
            }
          }
        }
      }
    },
    [aiFilledFields, tenant]
  )

  // ---- Form submission ----

  const submit = async (values: FormValues) => {
    try {
      if (!user || !tenant) throw new Error('No user')
      const details = {
        ...(values.heightCm ? { heightCm: Number(values.heightCm) } : {}),
        ...(values.weightKg ? { weightKg: Number(values.weightKg) } : {}),
        ...(values.bloodPressure ? { bloodPressure: values.bloodPressure } : {}),
        ...(values.temperatureC ? { temperatureC: Number(values.temperatureC) } : {}),
        ...(values.age ? { age: Number(values.age) } : {}),
        ...(values.diagnosis ? { diagnosis: values.diagnosis } : {}),
        ...(values.medications
          ? { prescribedMedications: values.medications.split(',').map((m) => m.trim()).filter(Boolean) }
          : {}),
        ...(values.followUp ? { followUpInstructions: values.followUp } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        summary: values.summary,
      }
      const extras: Record<string, string | number | boolean | null> = {}
      extraDefs.forEach((def) => {
        const raw = values.extras?.[def.key]
        if (raw === undefined || raw === '') return
        switch (def.type) {
          case 'number': {
            const num = Number(raw)
            extras[def.key] = Number.isFinite(num) ? num : null
            break
          }
          case 'bool':
            extras[def.key] = !!raw
            break
          case 'date':
            extras[def.key] = raw ? new Date(raw as string).toISOString() : null
            break
          default:
            extras[def.key] = String(raw)
        }
      })

      if (record) {
        await updateMedicalRecord(record.recordId, {
          ...record,
          summary: values.summary,
          details,
          extras,
          ...(appointmentId ? { appointmentId } : {}),
        })
        toast.success('Registro actualizado')
        onUpdated?.({
          ...record,
          summary: values.summary,
          details,
          extras,
          ...(appointmentId ? { appointmentId } : {}),
        })
      } else {
        const recordId = await createMedicalRecord(patientId, {
          summary: values.summary,
          details,
          tenantId: tenant.tenantId,
          createdBy: user.uid,
          patientId,
          extras,
          ...(appointmentId ? { appointmentId } : {}),
        })
        if (appointmentId) {
          // Fetch current appointment to get all required fields
          const currentAppt = await getAppointmentById(appointmentId)
          await updateAppointment(appointmentId, {
            ...currentAppt,
            status: 'completed',
            medicalRecordId: recordId,
          })
        }
        const newRec: MedicalRecord = {
          tenantId: tenant.tenantId,
          patientId,
          recordId,
          summary: values.summary,
          details,
          createdAt: new Date().toISOString(),
          createdBy: user.uid,
          extras,
          ...(appointmentId ? { appointmentId } : {}),
        }
        toast.success('Registro creado')
        onCreated?.(newRec)

        // SCRIBE-007: Track record saved after scribe usage
        if (originalAiFilledCountRef.current > 0) {
          trackEvent('scribe_record_saved', {
            tenantId: tenant.tenantId,
            fieldsAiFilledCount: originalAiFilledCountRef.current,
            fieldsManuallyEditedCount: reportedEditsRef.current.size,
          })
        }
      }
      onClose()
    } catch {
      toast.error('Error al guardar registro')
    }
  }

  // ---- SCRIBE-006: Inline "IA" badge rendered next to FormLabel ----
  const AiBadge = ({ fieldName }: { fieldName: string }) => {
    if (!isAiFilled(fieldName)) return null
    return (
      <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
        IA
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[100dvh] md:max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{record ? 'Editar registro' : 'Nuevo registro al historial'}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 min-h-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-3">

            {/* ---- AI Medical Scribe (SCRIBE-005) ---- */}
            {showScribe && (
              <ScribeRecorder
                customFields={extraDefs}
                onFieldsExtracted={applyScribeFields}
                onClear={clearScribeFields}
                disabled={form.formState.isSubmitting}
              />
            )}

            {/* ---- Summary ---- */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem className={cn(getAiFieldClasses('summary'))}>
                  <FormLabel>
                    Resumen
                    <AiBadge fieldName="summary" />
                  </FormLabel>
                  <Input
                    {...field}
                    onChange={handleFieldChange('summary', field.onChange)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---- Vitals grid ---- */}
            <div className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="heightCm"
                render={({ field }) => (
                  <FormItem className={cn(getAiFieldClasses('heightCm'))}>
                    <FormLabel>
                      Altura (cm)
                      <AiBadge fieldName="heightCm" />
                    </FormLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={handleFieldChange('heightCm', field.onChange)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightKg"
                render={({ field }) => (
                  <FormItem className={cn(getAiFieldClasses('weightKg'))}>
                    <FormLabel>
                      Peso (kg)
                      <AiBadge fieldName="weightKg" />
                    </FormLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={handleFieldChange('weightKg', field.onChange)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bloodPressure"
                render={({ field }) => (
                  <FormItem className={cn(getAiFieldClasses('bloodPressure'))}>
                    <FormLabel>
                      Presion
                      <AiBadge fieldName="bloodPressure" />
                    </FormLabel>
                    <Input
                      {...field}
                      onChange={handleFieldChange('bloodPressure', field.onChange)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperatureC"
                render={({ field }) => (
                  <FormItem className={cn(getAiFieldClasses('temperatureC'))}>
                    <FormLabel>
                      Temperatura (°C)
                      <AiBadge fieldName="temperatureC" />
                    </FormLabel>
                    <Input
                      type="number"
                      {...field}
                      onChange={handleFieldChange('temperatureC', field.onChange)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <Input type="number" min={0} {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ---- Diagnosis ---- */}
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem className={cn(getAiFieldClasses('diagnosis'))}>
                  <FormLabel>
                    Diagnostico
                    <AiBadge fieldName="diagnosis" />
                  </FormLabel>
                  <Textarea
                    {...field}
                    rows={2}
                    onChange={handleFieldChange('diagnosis', field.onChange)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---- Medications ---- */}
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem className={cn(getAiFieldClasses('medications'))}>
                  <FormLabel>
                    Medicamentos
                    <AiBadge fieldName="medications" />
                  </FormLabel>
                  <Input
                    {...field}
                    placeholder="separelos con coma"
                    onChange={handleFieldChange('medications', field.onChange)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---- Follow-up ---- */}
            <FormField
              control={form.control}
              name="followUp"
              render={({ field }) => (
                <FormItem className={cn(getAiFieldClasses('followUp'))}>
                  <FormLabel>
                    Instrucciones de seguimiento
                    <AiBadge fieldName="followUp" />
                  </FormLabel>
                  <Textarea
                    {...field}
                    rows={2}
                    onChange={handleFieldChange('followUp', field.onChange)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---- Notes ---- */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className={cn(getAiFieldClasses('notes'))}>
                  <FormLabel>
                    Notas adicionales
                    <AiBadge fieldName="notes" />
                  </FormLabel>
                  <Textarea
                    {...field}
                    rows={2}
                    onChange={handleFieldChange('notes', field.onChange)}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ---- Extra/custom fields ---- */}
            {extraDefs.map((def) => {
              const extrasFieldName = `extras.${def.key}`
              return (
                <FormField
                  key={def.key}
                  control={form.control}
                  name={`extras.${def.key}` as const}
                  render={({ field }) => (
                    <FormItem className={cn(getAiFieldClasses(extrasFieldName))}>
                      <FormLabel>
                        {def.label}
                        <AiBadge fieldName={extrasFieldName} />
                      </FormLabel>
                      {def.type === 'text' && (
                        <Input
                          {...field}
                          onChange={handleFieldChange(extrasFieldName, field.onChange)}
                        />
                      )}
                      {def.type === 'number' && (
                        <Input
                          type="number"
                          {...field}
                          onChange={handleFieldChange(extrasFieldName, field.onChange)}
                        />
                      )}
                      {def.type === 'bool' && (
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={handleFieldChange(extrasFieldName, field.onChange)}
                        />
                      )}
                      {def.type === 'date' && (
                        <Input
                          type="date"
                          {...field}
                          onChange={handleFieldChange(extrasFieldName, field.onChange)}
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            })}

            {/* ---- Submit button ---- */}
            <Button
              type="submit"
              className="w-full flex items-center gap-1"
              disabled={form.formState.isSubmitting}
            >
              {record ? 'Guardar' : <>Crear <Plus size={16} /></>}
            </Button>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
