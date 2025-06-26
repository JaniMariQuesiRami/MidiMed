"use client"

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

const phoneRegex = /^\+?\d{7,15}$/

const schema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  birthDate: z
    .string()
    .refine((v) => {
      const d = new Date(v)
      return !isNaN(d.getTime()) && d <= new Date()
    }, "Fecha inválida"),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  allergies: z.string().optional(),
  notes: z.string().optional(),
})

export type PatientFormValues = z.infer<typeof schema>

export default function PatientForm({
  open,
  onSubmit,
  onClose,
  initial,
  submitLabel,
  updatedAt,
}: {
  open: boolean
  onSubmit: (values: PatientFormValues) => Promise<void> | void
  onClose: () => void
  initial?: Partial<PatientFormValues>
  submitLabel: string
  updatedAt?: string
}) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      birthDate: "",
      phone: "",
      email: "",
      allergies: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: initial?.name ?? "",
        birthDate: initial?.birthDate ?? "",
        phone: initial?.phone ?? "",
        email: initial?.email ?? "",
        allergies: initial?.allergies ?? "",
        notes: initial?.notes ?? "",
      })
    }
  }, [open, initial, form])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de nacimiento</FormLabel>
              <Input type="date" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="allergies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alergias</FormLabel>
                <Textarea {...field} rows={3} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <Textarea {...field} rows={3} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">
            Última actualización: {format(new Date(updatedAt), "dd/MM/yyyy HH:mm")}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
