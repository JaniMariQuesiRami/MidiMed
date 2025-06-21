"use client"
import { cn } from "@/lib/utils"

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        "h-5 w-5",
        className,
      )}
    />
  )
}
