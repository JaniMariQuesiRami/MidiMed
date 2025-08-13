"use client"
import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

type Item = { id: string; label: string }

type Props = {
  items: Item[]
  selected: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  className?: string
}

export default function MultiSelectAutocomplete({
  items,
  selected,
  onChange,
  placeholder = 'Todos',
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

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const summary =
    selected.length === 0 ? placeholder : `${selected.length} ${placeholder.toLowerCase()}`

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        className="w-48 border rounded px-2 py-1 text-left bg-background"
        onClick={() => setOpen((o) => !o)}
      >
        {summary}
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
          <ul className="max-h-40 overflow-y-auto">
            {term === '' && (
              <li
                className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted ${
                  selected.length === 0 ? 'bg-muted' : ''
                }`}
                onMouseDown={() => {
                  onChange([])
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.length === 0}
                  readOnly
                  className="pointer-events-none accent-primary"
                />
                Todos
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-2 py-1 text-muted-foreground select-none">No encontrado</li>
            ) : (
              filtered.map((i) => (
                <li
                  key={i.id}
                  className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted ${
                    selected.includes(i.id) ? 'bg-muted' : ''
                  }`}
                  onMouseDown={() => toggle(i.id)}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(i.id)}
                    readOnly
                    className="pointer-events-none accent-primary"
                  />
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
