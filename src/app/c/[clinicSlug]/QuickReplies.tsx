// Horizontally scrollable quick-reply chip buttons extracted from AI numbered/bullet lists.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-B)

"use client"

import { motion, AnimatePresence } from "framer-motion"

type QuickRepliesProps = {
  chips: string[]
  onSelect: (chip: string) => void
}

export default function QuickReplies({ chips, onSelect }: QuickRepliesProps) {
  if (chips.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="flex gap-2 overflow-x-auto px-4 py-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.2 }}
      >
        {chips.map((chip, i) => (
          <motion.button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="shrink-0 rounded-full border border-primary px-4 py-2 text-sm text-primary transition-colors hover:bg-primary hover:text-white"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15, delay: i * 0.05 }}
          >
            {chip}
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
