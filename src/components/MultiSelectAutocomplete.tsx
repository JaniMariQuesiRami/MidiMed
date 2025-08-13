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

export default function MultiSelectAutocomplete({ items, selected, onChange, placeholder = 'Todos', className }: Props) {
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

  const filtered = term
    ? items.filter((i) =>
        i.label.toLowerCase().includes(term.toLowerCase()) && !selected.includes(i.id),
      )
    : items.filter((i) => !selected.includes(i.id))

  const remove = (id: string) => {
    onChange(selected.filter((s) => s !== id))
  }

  const select = (id: string) => {
    onChange([...selected, id])
    setTerm('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={"relative " + (className || '')}>
      <div className="flex flex-wrap items-center gap-1 border rounded px-2 py-1 bg-background w-48">
        {selected.map((id) => {
          const label = items.find((i) => i.id === id)?.label || id
          return (
            <span key={id} className="bg-primary text-white rounded px-1 text-xs flex items-center">
              {label}
              <button
                type="button"
                className="ml-1 text-white"
                onClick={() => remove(id)}
              >
                ×
              </button>
            </span>
          )
        })}
        <Input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
      </div>
      {open && (
        <ul className="absolute z-30 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-white dark:bg-background shadow">
          {term === '' && (
            <li
              className="cursor-pointer px-2 py-1 hover:bg-muted"
              onMouseDown={() => {
                onChange([])
                setOpen(false)
              }}
            >
              Todos
            </li>
          )}
          {filtered.length === 0 ? (
            <li className="px-2 py-1 text-muted-foreground select-none">No encontrado</li>
          ) : (
            filtered.map((i) => (
              <li
                key={i.id}
                className="cursor-pointer px-2 py-1 hover:bg-muted"
                onMouseDown={() => select(i.id)}
              >
                {i.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
