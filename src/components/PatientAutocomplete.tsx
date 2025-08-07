"use client"
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import type { Patient } from '@/types/db'

type Props = {
  patients: Patient[]
  value: string
  onChange: (v: string) => void
}

export default function PatientAutocomplete({ patients, value, onChange }: Props) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (value === 'all') setTerm('')
  }, [value])

  const filtered = term
    ? patients.filter((p) =>
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(term.toLowerCase()),
      )
    : patients

  return (
    <div ref={containerRef} className="relative">
      <Input
        placeholder="Todos"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className="w-40"
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white dark:bg-background shadow">
          {term === '' && (
            <li
              className="cursor-pointer px-2 py-1 hover:bg-muted"
              onMouseDown={() => {
                onChange('all')
                setTerm('')
                setOpen(false)
              }}
            >
              Todos
            </li>
          )}
          {filtered.length === 0 ? (
            <li className="px-2 py-1 text-muted-foreground select-none">
              Paciente no encontrado
            </li>
          ) : (
            filtered.map((p) => (
              <li
                key={p.patientId}
                className="cursor-pointer px-2 py-1 hover:bg-muted"
                onMouseDown={() => {
                  onChange(p.patientId)
                  setTerm(`${p.firstName} ${p.lastName}`)
                  setOpen(false)
                }}
              >
                {p.firstName} {p.lastName}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
