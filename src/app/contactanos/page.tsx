import tw from 'tailwind-styled-components'
import SharedHeader from '@/components/SharedHeader'

export default function ContactanosPage() {
  return (
    <Wrapper>
      <SharedHeader showAuthButtons={true} />
      <Content>
        <Title>Contáctanos</Title>
        <Description>
          Información de contacto y formulario vendrá aquí.
        </Description>
        {/* TODO: Add contact form and information */}
      </Content>
    </Wrapper>
  )
}

const Wrapper = tw.div`min-h-[100dvh] flex flex-col`
const Content = tw.main`flex-1 flex flex-col items-center justify-center px-8`
const Title = tw.h1`text-4xl font-bold mb-4`
const Description = tw.p`text-lg text-muted-foreground text-center max-w-md`
