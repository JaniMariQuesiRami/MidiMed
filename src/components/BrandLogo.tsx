'use client'

import Image from 'next/image'
import tw from 'tailwind-styled-components'

export default function BrandLogo() {
  return (
    <Wrapper>
      <Image src="/logoPrimary.svg" alt="Logo" width={28} height={28} />
      <BrandText>MidiMed</BrandText>
    </Wrapper>
  )
}

const Wrapper = tw.div`
  flex items-center gap-2
`

const BrandText = tw.span`
  text-primary text-lg font-semibold
`
