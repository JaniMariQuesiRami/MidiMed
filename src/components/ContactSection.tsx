'use client'

import tw from 'tailwind-styled-components'
import ContactForm from '@/components/ContactForm'

export default function ContactSection({ id = "contact" }: { id?: string }) {
  return (
    <Section id={id}>
      <ContentWrapper>
        <Header>
          <Title>Contáctanos</Title>
          <Subtitle>
            ¿Tienes alguna pregunta? Nos encantaría ayudarte
          </Subtitle>
        </Header>
        <FormWrapper>
          <ContactForm />
        </FormWrapper>
      </ContentWrapper>
    </Section>
  )
}

// Styled components
const Section = tw.section`
  relative w-full py-16 px-4
  bg-white dark:bg-slate-900
`

const ContentWrapper = tw.div`
  relative w-full max-w-4xl mx-auto
`

const Header = tw.div`
  text-center mb-12
`

const Title = tw.h2`
  text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4
`

const Subtitle = tw.p`
  text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto
`

const FormWrapper = tw.div`
  relative w-full
`
