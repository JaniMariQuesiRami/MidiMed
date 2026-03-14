// Single chat message bubble with Framer Motion entrance animation.
// AI messages render left-aligned with muted background; user messages render right-aligned with primary color.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-B)
// - 2026-03-14: Added markdown rendering for lists, bold, and line breaks

"use client"

import { motion } from "framer-motion"
import type { UIMessage } from "ai"
import React from "react"

type MessageBubbleProps = {
  message: UIMessage
  isLast: boolean
}

/** Renders inline markdown: **bold** */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/** Parses text into structured blocks: paragraphs and list items */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: React.ReactNode[] = []

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ol key={`list-${elements.length}`} className="list-decimal list-inside space-y-1">
          {currentList}
        </ol>
      )
      currentList = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushList()
      continue
    }

    // Numbered list: "1. text", "2. text", etc.
    const listMatch = line.match(/^(\d+)\.\s+(.+)/)
    if (listMatch) {
      currentList.push(
        <li key={`li-${i}`}>{renderInline(listMatch[2])}</li>
      )
      continue
    }

    // Bullet list: "- text" or "• text"
    const bulletMatch = line.match(/^[-•]\s+(.+)/)
    if (bulletMatch) {
      currentList.push(
        <li key={`li-${i}`}>{renderInline(bulletMatch[1])}</li>
      )
      continue
    }

    // Regular text
    flushList()
    elements.push(
      <p key={`p-${i}`}>{renderInline(line)}</p>
    )
  }

  flushList()
  return <div className="space-y-2">{elements}</div>
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"
  const text = message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")

  if (!text) return null

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-2xl rounded-tr-sm bg-primary text-white"
            : "rounded-2xl rounded-tl-sm bg-muted text-foreground"
        }`}
      >
        {isUser ? text : renderMarkdown(text)}
      </div>
    </motion.div>
  )
}
