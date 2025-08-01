import AuthScreenLayout from '@/components/AuthScreenLayout'

export default function FinishSignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthScreenLayout>{children}</AuthScreenLayout>
}
