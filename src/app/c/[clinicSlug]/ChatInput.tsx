// Chat text input with send button. Supports Enter-to-send and disabled state.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-B)
// - 2026-03-14: Switch to auto-growing textarea, fix mobile overflow

"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"

type ChatInputProps = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled: boolean
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea height based on content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex shrink-0 items-end gap-2 border-t px-4 py-3 overflow-hidden">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu mensaje..."
        enterKeyHint="send"
        aria-label="Escribe tu mensaje"
        rows={1}
        className="min-w-0 flex-1 resize-none rounded-2xl bg-muted px-4 py-2 text-base leading-relaxed outline-none focus:ring-2 focus:ring-primary/50"
      />
      <motion.button
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        aria-label="Enviar mensaje"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </motion.button>
    </div>
  )
}
