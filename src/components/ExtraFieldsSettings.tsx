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

const keyRegex = /^[a-z][a-zA-Z0-9]*$/

const schema = z.object({
  key: z.string().regex(keyRegex, 'camelCase requerido'),
  label: z.string().min(1, 'Etiqueta requerida'),
  type: z.enum(['text', 'number', 'bool', 'date']),
})

type FormValues = z.infer<typeof schema>

export default function ExtraFieldsSettings() {
  const { tenant } = useContext(UserContext)
  const [fields, setFields] = useState<ExtraFieldDef[]>([])
  const [open, setOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    if (tenant?.settings?.extraFields) {
      setFields(tenant.settings.extraFields.filter(f => f.collection === 'medicalRecords'))
    }
  }, [tenant])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { key: '', label: '', type: 'text' },
  })

  const resetForm = () => {
    form.reset({ key: '', label: '', type: 'text' })
    setEditingIndex(null)
  }

  const openAdd = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = (idx: number) => {
    const f = fields[idx]
    form.reset({ key: f.key, label: f.label, type: f.type })
    setEditingIndex(idx)
    setOpen(true)
  }

  const saveField = async (values: FormValues) => {
    if (!tenant) return
    const exists = fields.some((f, i) => f.key === values.key && i !== editingIndex)
    if (exists) {
      toast.error('La clave debe ser única')
      return
    }
    const newField: ExtraFieldDef = {
      key: values.key,
      label: values.label,
      type: values.type as ExtraFieldType,
      collection: 'medicalRecords',
    }
    let newFields: ExtraFieldDef[]
    if (editingIndex !== null) {
      newFields = fields.map((f, i) => (i === editingIndex ? newField : f))
    } else {
      newFields = [...fields, newField]
    }
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

  const deleteField = async (idx: number) => {
    if (!tenant) return
    if (!confirm('Eliminar campo?')) return
    const newFields = fields.filter((_, i) => i !== idx)
    try {
      await updateExtraFields(tenant.tenantId, newFields)
      setFields(newFields)
      tenant.settings.extraFields = newFields
      toast.success('Campo eliminado')
    } catch {
      toast.error('No se pudo eliminar')
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
            <TableHead>Key</TableHead>
            <TableHead>Etiqueta</TableHead>
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
                <TableCell>{f.key}</TableCell>
                <TableCell>{f.label}</TableCell>
                <TableCell>{f.type}</TableCell>
                <TableCell>{f.collection}</TableCell>
                <TableCell className="flex gap-2">
                  <button onClick={() => openEdit(idx)} className="cursor-pointer">Editar</button>
                  <button onClick={() => deleteField(idx)} className="cursor-pointer">Eliminar</button>
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
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <Input {...field} disabled={editingIndex !== null} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiqueta</FormLabel>
                    <Input {...field} />
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
                        <SelectItem value="bool">Booleano</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Colección</FormLabel>
                <Input value="medicalRecords" disabled />
              </div>
              <Button type="submit" className="w-full">Guardar</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Header = tw.div`flex justify-between items-center`
