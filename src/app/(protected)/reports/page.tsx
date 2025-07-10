'use client'
import ReportsDashboard from '@/components/ReportsDashboard'
import tw from 'tailwind-styled-components'

export default function ReportsPage() {
  return (
    <Wrapper>
      <ReportsDashboard />
    </Wrapper>
  )
}

const Wrapper = tw.div`px-2 sm:px-4 pt-4`
