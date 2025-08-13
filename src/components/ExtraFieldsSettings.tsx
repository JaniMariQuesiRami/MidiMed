'use client'

import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { updateExtraFields } from '@/db/organization'
import type { ExtraFieldDef, ExtraFieldType } from '@/types/db'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import { Pencil, Trash } from 'lucide-react'

const schema = z.object({
  label: z.string().min(1, 'Nombre requerido'),
  type: z.enum(['text', 'number', 'bool', 'date']),
})

type FormValues = z.infer<typeof schema>

export default function ExtraFieldsSettings() {
  const { tenant } = useContext(UserContext)
  const [fields, setFields] = useState<ExtraFieldDef[]>([])
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null)

  useEffect(() => {
    if (tenant?.settings?.extraFields) {
      setFields(tenant.settings.extraFields.filter(f => f.collection === 'medicalRecords'))
    }
  }, [tenant])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: '', type: 'text' },
  })

  const resetForm = () => {
    form.reset({ label: '', type: 'text' })
    setEditingIndex(null)
  }

  const openAdd = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (idx: number) => {
    const f = fields[idx]
    form.reset({ label: f.label, type: f.type })
    setEditingIndex(idx)
    setOpen(true)
  }

  // Helpers
  const toCamelCase = (str: string) => {
    const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const words = noAccents
      .toLowerCase()
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean)
    if (words.length === 0) return 'campo'
    const [first, ...rest] = words
    const base = [first, ...rest.map(w => w.charAt(0).toUpperCase() + w.slice(1))].join('')
    const startsWithLetter = /^[a-z]/.test(base)
    return startsWithLetter ? base : `campo${base.charAt(0).toUpperCase()}${base.slice(1)}`
  }

  const makeUniqueKey = (baseKey: string) => {
    let key = baseKey
    let i = 2
    const existing = new Set(fields.map(f => f.key))
    while (existing.has(key)) {
      key = `${baseKey}${i}`
      i += 1
    }
    return key
  }

  const saveField = async (values: FormValues) => {
    if (!tenant) return
    const collection = 'medicalRecords'
    let newField: ExtraFieldDef
    if (editingIndex !== null) {
      // No cambiar la clave en edición para no romper datos existentes
      const prev = fields[editingIndex]
      newField = {
        key: prev.key,
        label: values.label,
        type: values.type as ExtraFieldType,
        collection,
      }
    } else {
      // Generar clave camelCase única a partir del nombre
      const baseKey = toCamelCase(values.label)
      const uniqueKey = makeUniqueKey(baseKey)
      newField = {
        key: uniqueKey,
        label: values.label,
        type: values.type as ExtraFieldType,
        collection,
      }
    }
    let newFields: ExtraFieldDef[]
    if (editingIndex !== null) newFields = fields.map((f, i) => (i === editingIndex ? newField : f))
    else newFields = [...fields, newField]
    try {
      await updateExtraFields(tenant.tenantId, newFields)
      setFields(newFields)
      tenant.settings.extraFields = newFields
      toast.success('Guardado')
      setOpen(false)
      resetForm()
    } catch {
      toast.error('No se pudo guardar')
    }
  }

  const openDeleteConfirm = (idx: number) => {
    setFieldToDelete(idx)
    setDeleteConfirmOpen(true)
  }

  const deleteField = async () => {
    if (!tenant || fieldToDelete === null) return
    const idx = fieldToDelete
    const newFields = fields.filter((_, i) => i !== idx)
    try {
      await updateExtraFields(tenant.tenantId, newFields)
      setFields(newFields)
      tenant.settings.extraFields = newFields
      toast.success('Campo eliminado')
    } catch {
      toast.error('No se pudo eliminar')
    } finally {
      setDeleteConfirmOpen(false)
      setFieldToDelete(null)
    }
  }

  return (
    <Wrapper>
      <Header>
        <h1 className="text-lg font-medium">Campos de formularios</h1>
        <Button size="sm" onClick={openAdd}>Agregar campo</Button>
      </Header>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Colección</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-4 text-center">Sin campos</TableCell>
            </TableRow>
          ) : (
            fields.map((f, idx) => (
              <TableRow key={f.key}>
                <TableCell>{f.label}</TableCell>
                <TableCell>{typeToEs(f.type)}</TableCell>
                <TableCell>{collectionToEs(f.collection)}</TableCell>
                <TableCell className="flex gap-2">
                  <button onClick={() => openEdit(idx)} className="p-1 rounded hover:bg-muted cursor-pointer" aria-label="Editar">
                    <Pencil size={16} />
                  </button>
                    <button
                    onClick={() => openDeleteConfirm(idx)}
                    className="p-1 rounded hover:bg-muted cursor-pointer text-red-600"
                    aria-label="Eliminar"
                    >
                    <Trash size={16} />
                    </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Editar campo' : 'Nuevo campo'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(saveField)} className="space-y-3">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del campo</FormLabel>
                    <Input {...field} placeholder="Ej. Frecuencia cardíaca" />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="bool">Verdadero / Falso</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Colección</FormLabel>
                <Input className="mt-1" value="Registros Médicos" disabled />
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de que quieres eliminar este campo? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={deleteField}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex justify-between items-center`

// Display mappers
function typeToEs(t: ExtraFieldType) {
  switch (t) {
    case 'text':
      return 'Texto'
    case 'number':
      return 'Número'
    case 'bool':
      return 'Verdaero / Falso'
    case 'date':
      return 'Fecha'
    default:
      return t
  }
}

function collectionToEs(c: string) {
  if (c === 'medicalRecords') return 'Registros Médicos'
  return c
}
