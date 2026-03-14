// Single chat message bubble with Framer Motion entrance animation.
// AI messages render left-aligned with muted background; user messages render right-aligned with primary color.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-B)

"use client"

import { motion } from "framer-motion"
import type { UIMessage } from "ai"

type MessageBubbleProps = {
  message: UIMessage
  isLast: boolean
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
        {text}
      </div>
    </motion.div>
  )
}
