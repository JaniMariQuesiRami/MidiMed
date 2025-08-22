"use client"
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'

export type SingleItem = { id: string; label: string }

type Props = {
  items: SingleItem[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export default function SingleSelectAutocomplete({
  items,
  value,
  onChange,
  placeholder = 'Seleccione...',
  className,
}: Props) {
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
    if (!open) setTerm('')
  }, [open])

  const filtered = term
    ? items.filter((i) => i.label.toLowerCase().includes(term.toLowerCase()))
    : items

  const selectedLabel = items.find((i) => i.id === value)?.label

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        className="w-64 border rounded px-2 py-1 text-left bg-background"
        onClick={() => setOpen((o) => !o)}
      >
        {selectedLabel || <span className="text-muted-foreground">{placeholder}</span>}
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border bg-white dark:bg-background shadow">
          <div className="p-2 border-b">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Buscar..."
              className="h-8 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-2 py-1 text-muted-foreground select-none">No encontrado</li>
            ) : (
              filtered.map((i) => (
                <li
                  key={i.id}
                  className={`px-2 py-1 cursor-pointer hover:bg-muted ${
                    value === i.id ? 'bg-muted' : ''
                  }`}
                  onMouseDown={() => {
                    onChange(i.id)
                    setOpen(false)
                  }}
                >
                  {i.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
