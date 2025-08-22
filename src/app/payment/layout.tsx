import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resultado del Pago - MidiMed',
  description: 'Estado de tu proceso de pago en MidiMed',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
