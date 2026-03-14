// Animated typing indicator (three bouncing dots) shown while the AI is processing.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-B)

"use client"

import { motion } from "framer-motion"

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <motion.div
        className="flex gap-1.5 rounded-2xl rounded-tl-sm bg-muted px-4 py-3 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/50"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
