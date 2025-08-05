'use client'

import { useEffect } from 'react'
import { initPosthog } from '@/utils/posthogClient'

export default function PostHogInit() {
  useEffect(() => {
    initPosthog()
  }, [])
  return null
}
