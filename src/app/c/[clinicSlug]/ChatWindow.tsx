// Main client-side chat window for the public patient portal.
// Integrates AI SDK v6 useChat with clinic-specific transport, message rendering,
// typing indicators, quick replies, and auto-scroll.
// Changelog:
// - 2026-03-14: Initial placeholder creation (PHASE-3-A)
// - 2026-03-14: Full implementation with AI SDK v6 integration (PHASE-3-B)

"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import type { UIMessage } from "ai"
import Image from "next/image"
import MessageBubble from "./MessageBubble"
import ChatInput from "./ChatInput"
import TypingIndicator from "./TypingIndicator"
import QuickReplies from "./QuickReplies"

type ChatWindowProps = {
  tenantId: string
  clinicName: string
  logoUrl?: string
}

export default function ChatWindow({ tenantId, clinicName, logoUrl }: ChatWindowProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { clinicSlug: tenantId },
    }),
    messages: [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: `¡Hola! Bienvenido a ${clinicName}. Soy tu asistente virtual. ¿Cómo te llamas?`,
          },
        ],
      },
    ],
    onError: (err) => console.error("Chat error:", err),
  })

  // Auto-scroll when messages change or status updates
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, status])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || status !== "ready") return
    sendMessage({ text: trimmed })
    setInput("")
  }

  const handleQuickReply = (chip: string) => {
    if (status !== "ready") return
    sendMessage({ text: chip })
  }

  // Extract quick reply chips from the last assistant message
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
  const quickChips = status === "ready" ? extractQuickReplies(lastAssistant) : []

  return (
    <div className="flex h-dvh flex-col bg-background sm:bg-muted">
      <div className="mx-auto flex h-full w-full max-w-lg flex-col sm:my-4 sm:h-auto sm:max-h-[700px] sm:rounded-2xl sm:border sm:bg-background sm:shadow-xl">
        {/* Header */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={clinicName}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
              {clinicName.charAt(0)}
            </div>
          )}
          <span className="text-lg font-semibold text-foreground">{clinicName}</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} />
          ))}
          {status === "submitted" && <TypingIndicator />}
        </div>

        {/* Quick Replies */}
        {quickChips.length > 0 && (
          <QuickReplies chips={quickChips} onSelect={handleQuickReply} />
        )}

        {/* Input */}
        <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={status !== "ready"} />
      </div>
    </div>
  )
}

/**
 * Heuristic: extract numbered options or bullet items from the last AI message.
 * Returns an array of chip labels (2-6 items) or empty array.
 */
function extractQuickReplies(message?: UIMessage): string[] {
  if (!message) return []
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")

  const chips: string[] = []

  // Match numbered lists: "1. Option", "2. Option"
  const numbered = text.match(/\d+\.\s+(.+?)(?=\n|$)/g)
  if (numbered && numbered.length >= 2 && numbered.length <= 6) {
    for (const line of numbered) {
      const match = line.match(/\d+\.\s+(.+)/)
      if (match) chips.push(match[1].trim())
    }
    return chips
  }

  // Match bullet lists: "- Option" or "* Option"
  const bullets = text.match(/[-\u2022]\s+(.+?)(?=\n|$)/g)
  if (bullets && bullets.length >= 2 && bullets.length <= 6) {
    for (const line of bullets) {
      const match = line.match(/[-\u2022]\s+(.+)/)
      if (match) chips.push(match[1].trim())
    }
    return chips
  }

  return []
}
