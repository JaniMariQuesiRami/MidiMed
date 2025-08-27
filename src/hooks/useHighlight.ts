'use client'
import { useState, useEffect, useCallback } from 'react'

export interface HighlightOptions {
  elementId: string
  message?: string
  duration?: number
  pulse?: boolean
}

export function useHighlight() {
  const [activeHighlight, setActiveHighlight] = useState<HighlightOptions | null>(null)

  const highlight = useCallback((options: HighlightOptions) => {
    setActiveHighlight(options)
    
    // Auto-remove after duration
    if (options.duration) {
      setTimeout(() => {
        setActiveHighlight(null)
      }, options.duration)
    }
  }, [])

  const removeHighlight = useCallback(() => {
    setActiveHighlight(null)
  }, [])

  useEffect(() => {
    if (!activeHighlight) return

    const element = document.getElementById(activeHighlight.elementId)
    if (!element) return

    // Agregar clases de resaltado
    element.classList.add('onboarding-highlight')
    if (activeHighlight.pulse) {
      element.classList.add('onboarding-pulse')
    }

    // Scroll to element
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    })

    return () => {
      element.classList.remove('onboarding-highlight', 'onboarding-pulse')
    }
  }, [activeHighlight])

  return {
    activeHighlight,
    highlight,
    removeHighlight
  }
}
